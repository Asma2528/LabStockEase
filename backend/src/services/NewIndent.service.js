

const NewIndentModel = require("../models/new.indent.models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const { createNotification } = require("../services/RequisitionNotification.service");
const UserModel = require("../models/user.models");
const ChemicalModel = require("../models/chemicals.models");
const ProjectModel = require("../models/project.models");
const mongoose = require('mongoose');
const PracticalModel = require('../models/practical.models');
const OtherModel = require('../models/other.models');
const GeneralModel = require('../models/general.models');



// Map categoryType to corresponding model
const categoryModelMap = {
  Project: ProjectModel,
  Practical: PracticalModel,
  General: GeneralModel,
  Other: OtherModel,
};


  const codeFieldMap = {
  General: 'generalCode',
  Project: 'projectCode',
  Practical: 'practicalCode',
  Other: 'otherCode',
};

const getCategoryId = async (codeOrId, categoryType) => {
  const model = categoryModelMap[categoryType];
  if (!model) throw new Error(`Invalid categoryType: ${categoryType}`);

  // Check if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(codeOrId)) {
    const category = await model.findById(codeOrId);
    if (!category) throw new Error(`Category with id ${codeOrId} not found in ${categoryType}`);
    return category._id;
  }

  // Use the correct code field
  const codeFieldMap = {
    General: 'generalCode',
    Project: 'projectCode',
    Practical: 'practicalCode',
    Other: 'otherCode',
  };

  const codeField = codeFieldMap[categoryType];
  if (!codeField) throw new Error(`No code field defined for categoryType: ${categoryType}`);

  const category = await model.findOne({ [codeField]: codeOrId });
  if (!category) throw new Error(`Category with code ${codeOrId} not found in ${categoryType}`);

  console.log(category._id)
  return category._id;
};

class NewIndentService {

   static async generateCode() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
      const prefix = `NI-${year}${month}-`;
  
      // Find the latest requisition for the current month
      const lastNewIndent = await NewIndentModel.findOne({
        newindent_code: { $regex: `^${prefix}` }, // Match codes for the current month
      })
        .sort({ newindent_code: -1 }) // Sort descending to get the latest
        .exec();
  
      let nextNumber = "001";
      if (lastNewIndent) {
        const lastNumber = parseInt(lastNewIndent.newindent_code.split("-")[2], 10);
        nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
      }
  
      return `${prefix}${nextNumber}`;
    }
  
  // Create a new newIndent
  static async createNewIndent(newIndentData) {

          newIndentData.category = await getCategoryId(newIndentData.category, newIndentData.categoryType);


    // Find the requesting user by the provided requested_by id
    const user = await UserModel.findById(newIndentData.requested_by);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Build a notification message (using the number of items)
    const message = `New Indent with ${newIndentData.items.length} items has been requested by ${user.name}.`;

    const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

  const requirementDate = new Date(newIndentData.date_of_requirement);
  requirementDate.setHours(0, 0, 0, 0); // Reset time for comparison

  if (requirementDate < today) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid date selection. The date of requirement must be today or a future date."
    );
  }

  newIndentData.newindent_code = await this.generateCode();


    // Create the new newIndent document
    const NewIndent = await NewIndentModel.create(newIndentData);

    // Calculate the expiry date (1 day after the date_of_requirement)
    const expiryDate = new Date(newIndentData.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    try {
      await createNotification({
        userId: user._id,
        requisitionId: NewIndent._id,
        title: "New Indent Created",
        message: message,
        send_to: ["admin","manager"],
        type: "new_indent_created",
        expiresAt: expiryDate,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    return NewIndent;
  }

  static async getApprovedRequests(searchParams = {}) {

    console.log("Search Params:", searchParams);

    const filter = {};
  
    
    if (searchParams.newindent_code) {
      filter.newIndent = { $regex: searchParams.newindent_code, $options: 'i' };
    }
    
    console.log("NewIndent Filter:", filter.newIndent);
    
  if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
    }
    // Filter by status (default to all allowed statuses)
    if (searchParams.status) {
      filter.status = searchParams.status;
    } else {
      filter.status = { $in: ['Ordered'] };
    }
  
    // Date filter: search by date_of_requirement (covering the entire day)
    if (searchParams.date_of_requirement) {
      const date = new Date(searchParams.date_of_requirement);
      filter.date_of_requirement = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }
  
  
    // Requested By filter: find user by name or email and store its _id
    if (searchParams.requested_by) {
      const requestedBy = await UserModel.findOne({
        $or: [
          { name: { $regex: searchParams.requested_by, $options: 'i' } },
          { email: { $regex: searchParams.requested_by, $options: 'i' } }
        ]
      });
      if (requestedBy) {
        filter.requested_by = requestedBy._id;
      } else {
        console.log(`Requested by '${searchParams.requested_by}' not found.`);
        return []; // Return empty array if no matching user
      }
    }
  
   
    // Fetch and populate related fields
    const allNewIndents = await NewIndentModel.find(filter)
    
      .populate({
        path: 'requested_by',
        select: 'name email',
        model: UserModel,
      })
      .populate({
        path: 'approved_by',
        select: 'name email',
        model: UserModel,
      })
      .populate({
        path: 'ordered_by',
        select: 'name email',
        model: UserModel,
      });
   const enriched = await Promise.all(allNewIndents.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;
      

      if (model && req.category) {
        const category = await model.findById(req.category);
           

        const codeField = codeFieldMap[req.categoryType];

        if (category && codeField) {
          categoryCode = category[codeField];
        }
      }

      return { ...req.toObject(), categoryCode };
    }));

    return enriched;
  }

  static async getApprovedAndOrderedRequests(searchParams = {}) {

    console.log("Search Params:", searchParams);

    const filter = {};
  
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
    }

    if (searchParams.newindent_code) {
      filter.newIndent = { $regex: searchParams.newindent_code, $options: 'i' };
    }
    
    console.log("NewIndent Filter:", filter.newIndent);
    
  
    // Filter by status (default to all allowed statuses)
    if (searchParams.status) {
      filter.status = searchParams.status;
    } else {
      filter.status = { $in: ['Approved', 'Ordered'] };
    }
  
    // Date filter: search by date_of_requirement (covering the entire day)
    if (searchParams.date_of_requirement) {
      const date = new Date(searchParams.date_of_requirement);
      filter.date_of_requirement = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }
  
    
  
    // Requested By filter: find user by name or email and store its _id
    if (searchParams.requested_by) {
      const requestedBy = await UserModel.findOne({
        $or: [
          { name: { $regex: searchParams.requested_by, $options: 'i' } },
          { email: { $regex: searchParams.requested_by, $options: 'i' } }
        ]
      });
      if (requestedBy) {
        filter.requested_by = requestedBy._id;
      } else {
        console.log(`Requested by '${searchParams.requested_by}' not found.`);
        return []; // Return empty array if no matching user
      }
    }
  
   
    // Fetch and populate related fields
    const allNewIndents = await NewIndentModel.find(filter)
    
      .populate({
        path: 'requested_by',
        select: 'name email',
        model: UserModel,
      })
      .populate({
        path: 'approved_by',
        select: 'name email',
        model: UserModel,
      })
      .populate({
        path: 'ordered_by',
        select: 'name email',
        model: UserModel,
      });
  
    const enriched = await Promise.all(allNewIndents.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;
      

      if (model && req.category) {
        const category = await model.findById(req.category);
           

        const codeField = codeFieldMap[req.categoryType];

        if (category && codeField) {
          categoryCode = category[codeField];
        }
      }

      return { ...req.toObject(), categoryCode };
    }));

    return enriched;
  }

// Retrieve all newIndents with optional search filters
static async getAllNewIndents(searchParams = {}) {
  const filter = {};

  if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
    }

  if (searchParams.newindent_code) {
    filter.newindent_code = { $regex: searchParams.newindent_code, $options: "i" };
  }

  // Filter by status (default to all allowed statuses)
  if (searchParams.status) {
    filter.status = searchParams.status;
  } else {
    filter.status = { $in: ['Pending', 'Approved', 'Rejected', 'Ordered'] };
  }

  // Date filter: search by date_of_requirement (covering the entire day)
  if (searchParams.date_of_requirement) {
    const date = new Date(searchParams.date_of_requirement);
    filter.date_of_requirement = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lte: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

 

  // Requested By filter: find user by name or email and store its _id
  if (searchParams.requested_by) {
    const requestedBy = await UserModel.findOne({
      $or: [
        { name: { $regex: searchParams.requested_by, $options: 'i' } },
        { email: { $regex: searchParams.requested_by, $options: 'i' } }
      ]
    });
    if (requestedBy) {
      filter.requested_by = requestedBy._id;
    } else {
      console.log(`Requested by '${searchParams.requested_by}' not found.`);
      return []; // Return empty array if no matching user
    }
  }

 
  // Fetch and populate related fields
  const allNewIndents = await NewIndentModel.find(filter)
  
    .populate({
      path: 'requested_by',
      select: 'name email',
      model: UserModel,
    })
    .populate({
      path: 'approved_by',
      select: 'name email',
      model: UserModel,
    })
    .populate({
      path: 'ordered_by',
      select: 'name email',
      model: UserModel,
    });

    const enriched = await Promise.all(allNewIndents.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;
      

      if (model && req.category) {
        const category = await model.findById(req.category);
           

        const codeField = codeFieldMap[req.categoryType];

        if (category && codeField) {
          categoryCode = category[codeField];
        }
      }

      return { ...req.toObject(), categoryCode };
    }));

    return enriched;

}


static async updateNewIndent(newIndentId, updateData, facultyEmail) {

  // Validate that updateData exists
  if (!updateData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No update data provided");
  }

   if (updateData.categoryCode) {
  updateData.category = updateData.categoryCode;
  delete updateData.categoryCode;
}


  // Step 1: Find faculty by email
  const faculty = await UserModel.findOne({ email: facultyEmail });
  if (!faculty) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Step 2: Find the newIndent that matches therequisitionId and faculty email
  const existingNewIndent = await NewIndentModel.findOne({
    _id:newIndentId,
    requested_by: faculty._id,
  });

  if (!existingNewIndent) {
    throw new ApiError(httpStatus.NOT_FOUND, "NewIndent not found");
  }

  // Step 3: Handle different status update cases
  if (existingNewIndent.status !== "Pending") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Pending requests can only be updated. Please make a new request"
    );
  } 
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

  const requirementDate = new Date(updateData.date_of_requirement);
  requirementDate.setHours(0, 0, 0, 0); // Reset time for comparison

  if (requirementDate < today) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid date selection. The date of requirement must be today or a future date."
    );
  }
  

  // Step 5: Update the newIndent in the database
  const newIndent = await NewIndentModel.findOneAndUpdate(
    { _id:newIndentId, requested_by: faculty._id },
    updateData,
    { new: true }
  );

  if (!newIndent) {
    throw new ApiError(httpStatus.NOT_FOUND, "New Indent update failed or not found");
  }

  // Step 6: Prepare and send notifications
  let title = "New Indent Updated";
  let notificationType = "new_indent_update";
  let message = `New Indent has been updated by ${faculty.name}.`;


  const expiryDate = new Date(newIndent.date_of_requirement);
  expiryDate.setDate(expiryDate.getDate() + 1);

  try {
    await createNotification({
      userId: faculty._id,
     requisitionId: newIndent._id,
      title,
      message,
      send_to: ["admin","manager"], // Assuming admin is notified for all newIndent updates
      type: notificationType,
      expiresAt: expiryDate,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }

  return newIndent;
}


  // Delete a newIndent (only if it is still Pending)
  static async deleteNewIndent(newIndentId, userId) {
    const deletedNewIndent = await NewIndentModel.findOneAndDelete({
      _id:newIndentId,
      requested_by: userId,
      status: "Pending",
    })

    if (!deletedNewIndent) {
      throw new ApiError(httpStatus.NOT_FOUND, "New Indent not found or cannot be deleted");
    }

    const faculty = await UserModel.findById(userId);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const message = `New Indent has been deleted by ${faculty.name}.`;

    const expiryDate = new Date(deletedNewIndent.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    await createNotification({
      userId: faculty._id,
     requisitionId: deletedNewIndent._id,
      title: "New Indent Deleted",
      message,
      send_to: ["admin","manager"],
      type: "new_indent_delete",
      expiresAt: expiryDate,
    });

    return deletedNewIndent;
  }

  static async getUserNewIndent(userEmail, searchParams = {}) {

  
    const filter = {};
  
    try {
if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
    }
      if (searchParams.newindent_code) {
        filter.newindent_code = { $regex: searchParams.newindent_code, $options: "i" };
      }
    
      // Handle "requested_by" filter
      if (searchParams.requested_by) {
        const matchingUsers = await UserModel.find({
          $or: [
            { name: { $regex: searchParams.requested_by, $options: 'i' } },
            { email: { $regex: searchParams.requested_by, $options: 'i' } }
          ]
        });
        if (matchingUsers.length > 0) {
          filter.requested_by = { $in: matchingUsers.map(user => user._id) };
        } else {
          console.log(`Requested by '${searchParams.requested_by}' not found.`);
          return [];
        }
      } else {
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found");
        }
        filter.requested_by = user._id;
      }
  
      // Handle other filters
      if (searchParams.status) filter.status = searchParams.status;
      if (searchParams.date_of_requirement) {
        const date = new Date(searchParams.date_of_requirement);
        filter.date_of_requirement = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        };
      }
  
     
  
      // Fetch data
      const userNewIndents = await NewIndentModel.find(filter)
     
        .populate({
          path: 'requested_by',
          select: 'name email',
          model: UserModel,
        })
        .populate({
          path: 'approved_by',
          select: 'name email',
          model: UserModel,
        })
        .populate({
          path: 'ordered_by',
          select: 'name email',
          model: UserModel,
        });
  
  const enrichedRequisitions = await Promise.all(userNewIndents.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;
      

      if (model && req.category) {
        const category = await model.findById(req.category);
//         console.log(category);
//         console.log("req.categoryType:", req.categoryType);         // General
// console.log("req.category:", req.category);                 // ObjectId
// console.log("model used:", model.modelName);                // Should be General

        const codeField = codeFieldMap[req.categoryType];

        if (category && codeField) {
          categoryCode = category[codeField];
        }
      }

      return { ...req.toObject(), categoryCode };
    }));

    // console.log("Enriched Requisitions:", enrichedRequisitions);
    return enrichedRequisitions;
    } catch (error) {
      console.error("Error fetching new indents:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching new indents");
    }
   
  }
  
  
 

  
  static async approveNewIndent(approvedbyId, data) {

    const allowedStatuses = ["Approved", "Rejected"];
    if (!allowedStatuses.includes(data.status)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status");
    }

    // Fetch the newIndent
    const newIndent = await NewIndentModel.findById(data.id);
    if (!newIndent) {
      throw new ApiError(httpStatus.NOT_FOUND, "New Indent not found");
    }

    // Look up the admin user by their _id (approved_by should be an ObjectId)
    const admin = await UserModel.findById(approvedbyId);
    if (!admin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
    }

    // Get the user who requested the newIndent
    const faculty = await UserModel.findById(newIndent.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const updatedItems = newIndent.items.map((item) => {
        // Find the matching data item based on the item name
        const matchingDataItem = data.items.find((dataItem) => dataItem.item === item.item);
        // Update the remark if a matching item is found; otherwise, set it to an empty string
        item.remark = matchingDataItem ? matchingDataItem.remark : '';
        return item;
      });
      

    // Update the newIndent status and other fields (including item remarks)
    const updatedNewIndent = await NewIndentModel.findOneAndUpdate(
      { _id: data.id },
      {
        status: data.status,
        approved_by: admin._id,  // Use admin._id for ObjectId
        approved_at: data.approved_at || new Date(),
        remark: data.remark || '',  // Ensure we handle optional general remark
        items: updatedItems,  // Update the items with their specific remarks
      },
      { new: true }  // Return the updated newIndent
    );

    if (!updatedNewIndent) {
      throw new ApiError(httpStatus.NOT_FOUND, "New Indent not found or cannot be modified");
    }

    // Prepare the notification message
    const message = `New Indent has been ${data.status} by ${admin.name}.`;  // Use data.status here

    // Determine recipients based on the user's role
    const sendToRoles = faculty.roles.includes("faculty") ? ["faculty"] : ["lab-assistant"];

    // Expiry date for the notification
    const expiryDate = new Date(newIndent.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);  // Set expiry date to 1 day after the required date

    // Create notification based on the status
    if (data.status === "Approved") {
      await createNotification({
        userId: faculty._id,
       requisitionId: updatedNewIndent._id,
        title: `New Indent ${data.status}`,
        message,
        send_to: [...sendToRoles, "lab-assistant"],  
        type: "new_indent_approved",
        expiresAt: expiryDate,
      });
    } else if (data.status === "Rejected") {
      await createNotification({
        userId: faculty._id,
       requisitionId: updatedNewIndent._id,
        title: `New Indent ${data.status}`,
        message,
        send_to: sendToRoles,
        type: "new_indent_rejected",
        expiresAt: expiryDate,
      });
    }

    return updatedNewIndent;  // Return the updated newIndent
}




  static async changeStatusToOrdered(newIndentData, orderedById) {
    // Ensure that the status being passed is "Issued"
    if (newIndentData.status !== "Ordered") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Status can only be changed to "Ordered"');
    }

    // Fetch the newIndent by its id (provided in newIndentData)
    const newIndent = await NewIndentModel.findById(newIndentData._id);
    if (!newIndent) {
      throw new ApiError(httpStatus.NOT_FOUND, "New Indent not found or cannot be modified");
    }
    if (newIndent.status === "Ordered") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot change status to "Ordered" as it is already "Ordered"');
    }
    if (newIndent.status !== "Approved") {
      throw new ApiError(httpStatus.BAD_REQUEST, `Cannot order New Indent with status: ${newIndent.status}`);
    }
  

    const orderer = await UserModel.findById(orderedById);
    if (!orderer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Orderer not found");
    }
  
    // Update the newIndent fields
    newIndent.status = "Ordered";
    newIndent.ordered_by = orderer._id;
    newIndent.ordered_at = new Date();
    newIndent.updatedAt = new Date(); // Optional if timestamps are enabled
  
    try {
      await newIndent.save();
    } catch (error) {
      console.error("Error saving newIndent:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to order newIndent");
    }
  
    // Get the faculty (the user who requested the newIndent)
    const faculty = await UserModel.findById(newIndent.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
  
    // Prepare notification details
    const message = `New Indent has been ordered.`;
    const expiryDate = new Date(newIndent.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);
  
    await createNotification({
      userId: faculty._id,
     requisitionId: newIndent._id,
      title: "New Indent Ordered",
      message,
      send_to: ["stores", "faculty", "admin"],
      type: "new_indent_ordered",
      expiresAt: expiryDate,
    });
  
    return newIndent;
  }

  
  static async changeStatusToIssued(newIndentData, issuedById) {
    // Ensure that the status being passed is "Issued"
    if (newIndentData.status !== "Issued") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Status can only be changed to "Issued"');
    }

    // Fetch the newIndent by its id (provided in newIndentData)
    const newIndent = await NewIndentModel.findById(newIndentData._id);
    if (!newIndent) {
      throw new ApiError(httpStatus.NOT_FOUND, "New Indent not found or cannot be modified");
    }
  
  

    const issuer = await UserModel.findById(issuedById);
    if (!issuer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Issuer not found");
    }
  
    // Update the newIndent fields
    newIndent.status = "Issued";

  
    try {
      await newIndent.save();
    } catch (error) {
      console.error("Error saving newIndent:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to issue newIndent");
    }
  
    // Get the faculty (the user who requested the newIndent)
    const faculty = await UserModel.findById(newIndent.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
  
    // Prepare notification details
    const message = `New Indent has been issued.`;
    const expiryDate = new Date(newIndent.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);
  
    await createNotification({
      userId: faculty._id,
     requisitionId: newIndent._id,
      title: "New Indent Issued",
      message,
      send_to: ["stores", "faculty", "admin"],
      type: "new_indent_issued",
      expiresAt: expiryDate,
    });
  
    return newIndent;
  }

}

module.exports = NewIndentService;
