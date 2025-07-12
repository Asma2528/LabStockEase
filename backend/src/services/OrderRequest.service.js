

const OrderRequestModel = require("../models/order.request.models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const { createNotification } = require("../services/RequisitionNotification.service");
const UserModel = require("../models/user.models");
const ChemicalsModel = require("../models/chemicals.models");
const BooksModel = require('../models/books.models');
const GlasswaresModel = require('../models/glasswares.models');
const ConsumablesModel = require('../models/consumables.models');
const EquipmentsModel = require('../models/equipments.models');
const OthersModel = require('../models/others.models');
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


const getItemId = async (itemCode, itemClass) => {
  const modelMap = {
    'Chemicals': require('../models/chemicals.models'),
    'Equipments': require('../models/equipments.models'),
    'Glasswares': require('../models/glasswares.models'),
    'Others': require('../models/others.models'),
    'Books': require('../models/books.models'),
    'Consumables': require('../models/consumables.models'),
  };
  const ItemModel = modelMap[itemClass];
  if (!ItemModel) throw new Error(`Invalid item class: ${itemClass}`);

  const item = await ItemModel.findOne({ item_code: itemCode });
  if (!item) throw new Error(`Item with code ${itemCode} not found in class ${itemClass}`);
  return item._id;
};

const getItemDetails = async (itemId, itemClass) => {
  const modelMap = {
    'Chemicals': ChemicalsModel,
    'Books': BooksModel,
    'Glasswares': GlasswaresModel,
    'Consumables': ConsumablesModel,
    'Equipments': EquipmentsModel,
    'Others': OthersModel,
  };


  const ItemModel = modelMap[itemClass];
  if (!ItemModel) throw new Error(`Invalid item class: ${itemClass}`);

  const item = await ItemModel.findById(itemId).select('item_code item_name description current_quantity');
  return item || null; // Return null if item not found
};

class OrderRequestService {

  static async generateCode() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `O-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastOrderRequest = await OrderRequestModel.findOne({
      orderRequest_code: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ orderRequest_code: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastOrderRequest) {
      const lastNumber = parseInt(lastOrderRequest.orderRequest_code.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }

  // Create a new orderRequest
  static async createOrderRequest(orderRequestData) {
    orderRequestData.category = await getCategoryId(orderRequestData.category, orderRequestData.categoryType);

    // Find the requesting user by the provided requested_by id
    const user = await UserModel.findById(orderRequestData.requested_by);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Build a notification message (using the number of items)
    const message = `Order Request with ${orderRequestData.items.length} items has been requested by ${user.name}.`;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

    const requirementDate = new Date(orderRequestData.date_of_requirement);
    requirementDate.setHours(0, 0, 0, 0); // Reset time for comparison

    if (requirementDate < today) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid date selection. The date of requirement must be today or a future date."
      );
    }

    orderRequestData.orderRequest_code = await this.generateCode();

    // Process each item in the items array:
    if (orderRequestData.items && Array.isArray(orderRequestData.items)) {
      for (let i = 0; i < orderRequestData.items.length; i++) {
        const itemObj = orderRequestData.items[i];
        // If the provided item is not a valid ObjectId, convert it using getItemId
        if (!mongoose.Types.ObjectId.isValid(itemObj.item)) {
          itemObj.item = await getItemId(itemObj.item, itemObj.class);
        }

        const modelMap = {
          'Chemicals': ChemicalsModel,
          'Equipments': EquipmentsModel,
          'Glasswares': GlasswaresModel,
          'Others': OthersModel,
          'Books': BooksModel,
          'Consumables': ConsumablesModel,
        };

        const ItemModel = modelMap[itemObj.class];
        if (!ItemModel) {
          throw new ApiError(httpStatus.BAD_REQUEST, `Invalid item class: ${itemObj.class}`);
        }
        const inventoryItem = await ItemModel.findById(itemObj.item);
        if (!inventoryItem) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Item not found in ${itemObj.class} for item id: ${itemObj.item}`
          );
        }

      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Items array is required");
    }

    // Create the new orderRequest document
    const newOrderRequest = await OrderRequestModel.create(orderRequestData);

    // Calculate the expiry date (1 day after the date_of_requirement)
    const expiryDate = new Date(orderRequestData.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    try {
      await createNotification({
        userId: user._id,
        requisitionId: newOrderRequest._id,
        title: "Order Request Created",
        message: message,
        send_to: ["admin", "manager"],
        type: "order_request_created",
        expiresAt: expiryDate,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    return newOrderRequest;
  }

  // Retrieve all orderRequests with optional search filters
  static async getAllOrderRequests(searchParams = {}) {
    const filter = {};

    if (searchParams.orderRequest_code) {
      filter.orderRequest_code = { $regex: searchParams.orderRequest_code, $options: "i" };
    }
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
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

    // ✅ Item Code Filter (search across models)
    if (searchParams.itemCode) {
      const modelMap = {
        'Chemical': ChemicalsModel,
        'Book': BooksModel,
        'Glassware': GlasswaresModel,
        'Consumable': ConsumablesModel,
        'Equipment': EquipmentsModel,
        'Other': OthersModel,
      };

      let foundItem = null;
      let itemClass = null;

      for (const [className, Model] of Object.entries(modelMap)) {
        foundItem = await Model.findOne({
          item_code: { $regex: `^${searchParams.itemCode}$`, $options: 'i' }
        });

        if (foundItem) {
          itemClass = className;
          break;
        }
      }

      if (!foundItem) {
        console.log(`Item with code '${searchParams.itemCode}' not found.`);
        return []; // No item found
      }

      // Now filter requisitions by nested items array
      filter.items = {
        $elemMatch: {
          item: foundItem._id,
          class: itemClass
        }
      };
    }

    // Fetch and populate related fields
    const allOrderRequests = await OrderRequestModel.find(filter)

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

    const enriched = await Promise.all(allOrderRequests.map(async (req) => {
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


  static async updateOrderRequest(orderRequestId, updateData, facultyEmail) {
    // Validate that updateData exists
    if (!updateData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No update data provided");
    }


    if (updateData.categoryCode) {
      updateData.category = updateData.categoryCode;
      delete updateData.categoryCode;
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


    // Step 1: Find faculty by email
    const faculty = await UserModel.findOne({ email: facultyEmail });
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }


    // Step 2: Find the orderRequest that matches therequisitionId and faculty email
    const existingOrderRequest = await OrderRequestModel.findOne({
      _id: orderRequestId,
      requested_by: faculty._id,
    });

    if (!existingOrderRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "OrderRequest not found");
    }

    // Step 3: Handle different status update cases
    if (existingOrderRequest.status !== "Pending") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Pending requests can only be updated. Please make a new request"
      );
    }

    // Step 4: Process items in updateData
    if (updateData.items && Array.isArray(updateData.items)) {
      for (let i = 0; i < updateData.items.length; i++) {
        const itemObj = updateData.items[i];

        // Validate and update item ID if needed
        if (itemObj.item && !mongoose.Types.ObjectId.isValid(itemObj.item)) {
          itemObj.item = await getItemId(itemObj.item, itemObj.class);
          if (!itemObj.item) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item or class provided");
          }
        }

        // Ensure quantity_returned is valid for return status
        if (updateData.status === "Return" && (!itemObj.quantity_returned || itemObj.quantity_returned <= 0)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Item ${itemObj.item} must have a valid quantity_returned when status is 'Return'`
          );
        }


        const modelMap = {
          'Chemicals': ChemicalsModel,
          'Equipments': EquipmentsModel,
          'Glasswares': GlasswaresModel,
          'Others': OthersModel,
          'Books': BooksModel,
          'Consumables': ConsumablesModel,
        };

        const ItemModel = modelMap[itemObj.class];
        if (!ItemModel) {
          throw new ApiError(httpStatus.BAD_REQUEST, `Invalid item class: ${itemObj.class}`);
        }

        const inventoryItem = await ItemModel.findById(itemObj.item);
        if (!inventoryItem) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Item not found in ${itemObj.class} for item id: ${itemObj.item}`
          );
        }
      }
    }
        // Step 5: Update the orderRequest in the database
        const orderRequest = await OrderRequestModel.findOneAndUpdate(
          { _id: orderRequestId, requested_by: faculty._id },
          updateData,
          { new: true }
        );

        if (!orderRequest) {
          throw new ApiError(httpStatus.NOT_FOUND, "Order Request update failed or not found");
        }

        // Step 6: Prepare and send notifications
        let title = "Order Request Updated";
        let notificationType = "order_request_update";
        let message = `OrderRequest has been updated by ${faculty.name}.`;


        const expiryDate = new Date(orderRequest.date_of_requirement);
        expiryDate.setDate(expiryDate.getDate() + 1);

        try {
          await createNotification({
            userId: faculty._id,
            requisitionId: orderRequest._id,
            title,
            message,
            send_to: ["admin", "manager"], // Assuming admin is notified for all orderRequest updates
            type: notificationType,
            expiresAt: expiryDate,
          });
        } catch (error) {
          console.error("Error creating notification:", error);
        }

        return orderRequest;
      }


  // Delete a orderRequest (only if it is still Pending)
  static async deleteOrderRequest(orderRequestId, userId) {
    const deletedOrderRequest = await OrderRequestModel.findOneAndDelete({
      _id: orderRequestId,
      requested_by: userId,
      status: "Pending",
    }).populate("items.item", "item_name");

    if (!deletedOrderRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order Request not found or cannot be deleted");
    }

    const faculty = await UserModel.findById(userId);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const message = `Order Request has been deleted by ${faculty.name}.`;

    const expiryDate = new Date(deletedOrderRequest.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    await createNotification({
      userId: faculty._id,
      requisitionId: deletedOrderRequest._id,
      title: "Order Request Deleted",
      message,
      send_to: ["admin", "manager"],
      type: "order_request_delete",
      expiresAt: expiryDate,
    });

    return deletedOrderRequest;
  }

  static async getUserOrderRequest(userEmail, searchParams = {}) {
    const filter = {};


    if (searchParams.orderRequest_code) {
      filter.orderRequest_code = { $regex: searchParams.orderRequest_code, $options: "i" };
    }
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
    }
    // If a "requested_by" search term is provided, use it to find matching users.
    if (searchParams.requested_by) {
      // Find all users whose name or email matches the search term (case-insensitive)
      const matchingUsers = await UserModel.find({
        $or: [
          { name: { $regex: searchParams.requested_by, $options: 'i' } },
          { email: { $regex: searchParams.requested_by, $options: 'i' } }
        ]
      });
      if (matchingUsers.length > 0) {
        // Filter orderRequests where requested_by is in the list of matching user IDs.
        filter.requested_by = { $in: matchingUsers.map(user => user._id) };
      } else {
        console.log(`Requested by '${searchParams.requested_by}' not found.`);
        return []; // Return an empty array if no matching user is found.
      }
    } else {
      // If no "requested_by" search term is provided, default to the userEmail parameter.
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }
      filter.requested_by = user._id;
    }

    // Filter by status
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



    // Item filter: search in the nested items array by item_code
    if (searchParams.item) {
      const item = await ChemicalModel.findOne({
        item_code: { $regex: searchParams.item, $options: 'i' }
      });
      if (item) {
        filter["items.item"] = item._id;
      } else {
        console.log(`Item '${searchParams.item}' not found.`);
        return [];
      }
    }

    // Fetch and populate related fields
    const userOrderRequests = await OrderRequestModel.find(filter)

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

    const enriched = await Promise.all(userOrderRequests.map(async (req) => {
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


  static async approveOrderRequest(approvedbyId, data) {

    const allowedStatuses = ["Approved", "Rejected"];
    if (!allowedStatuses.includes(data.status)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status");
    }

    // Fetch the orderRequest
    const orderRequest = await OrderRequestModel.findById(data.id);
    if (!orderRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order Request not found");
    }

    // Look up the admin user by their _id (approved_by should be an ObjectId)
    const admin = await UserModel.findById(approvedbyId);
    if (!admin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
    }

    // Get the user who requested the orderRequest
    const faculty = await UserModel.findById(orderRequest.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const updatedItems = orderRequest.items.map((item) => {
      const itemRemark = data.items.find((dataItem) => dataItem.item_id.toString() === item._id.toString())?.remark || ''; // Use item_id instead of _id
      item.remark = itemRemark;
      return item;
    });


    // Update the orderRequest status and other fields (including item remarks)
    const updatedOrderRequest = await OrderRequestModel.findOneAndUpdate(
      { _id: data.id },
      {
        status: data.status,
        approved_by: admin._id,  // Use admin._id for ObjectId
        approved_at: data.approved_at || new Date(),
        remark: data.remark || '',  // Ensure we handle optional general remark
        items: updatedItems,  // Update the items with their specific remarks
      },
      { new: true }  // Return the updated orderRequest
    );

    if (!updatedOrderRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order Request not found or cannot be modified");
    }

    // Prepare the notification message
    const message = `Order Request has been ${data.status} by ${admin.name}.`;  // Use data.status here

    // Determine recipients based on the user's role
    const sendToRoles = faculty.roles.includes("faculty") ? ["faculty"] : ["lab-assistant"];

    // Expiry date for the notification
    const expiryDate = new Date(orderRequest.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);  // Set expiry date to 1 day after the required date

    // Create notification based on the status
    if (data.status === "Approved") {
      await createNotification({
        userId: faculty._id,
        requisitionId: updatedOrderRequest._id,
        title: `Order Request ${data.status}`,
        message,
        send_to: [...sendToRoles, "lab-asistant"],
        type: "order_request_approved",
        expiresAt: expiryDate,
      });
    } else if (data.status === "Rejected") {
      await createNotification({
        userId: faculty._id,
        requisitionId: updatedOrderRequest._id,
        title: `Order Request ${data.status}`,
        message,
        send_to: sendToRoles,
        type: "order_request_rejected",
        expiresAt: expiryDate,
      });
    }

    return updatedOrderRequest;  // Return the updated orderRequest
  }


  // Retrieve approved and ordered orderRequests (for viewing)
  static async getApprovedAndOrderedRequests(searchParams = {}) {
    const filter = { status: { $in: ["Approved", "Ordered"] } };

    if (searchParams.orderRequest_code) {
      filter.orderRequest_code = { $regex: searchParams.orderRequest_code, $options: "i" };
    }
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
    }
    // If an item name is provided, search within the items array’s description field
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

    // Item filter: search in the nested items array by item_code
    if (searchParams.item) {
      const item = await ChemicalModel.findOne({
        item_code: { $regex: searchParams.item, $options: 'i' }
      });
      if (item) {
        filter["items.item"] = item._id;
      } else {
        console.log(`Item '${searchParams.item}' not found.`);
        return [];
      }
    }
    // Fetch and populate related fields
    const allOrderRequests = await OrderRequestModel.find(filter)

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



    const enrichedRequisitions = await Promise.all(allOrderRequests.map(async (req) => {
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

    return enrichedRequisitions;
  }


  static async getApprovedRequests(searchParams = {}) {
    const filter = { status: { $in: ["Ordered"] } };

    if (searchParams.orderRequest_code) {
      filter.orderRequest_code = { $regex: searchParams.orderRequest_code, $options: "i" };
    }

    // If an item name is provided, search within the items array’s description field
    // Filter by status (default to all allowed statuses)
    if (searchParams.status) {
      filter.status = searchParams.status;
    } else {
      filter.status = { $in: ['Ordered'] };
    }
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
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

    // Item filter: search in the nested items array by item_code
    if (searchParams.item) {
      const item = await ChemicalModel.findOne({
        item_code: { $regex: searchParams.item, $options: 'i' }
      });
      if (item) {
        filter["items.item"] = item._id;
      } else {
        console.log(`Item '${searchParams.item}' not found.`);
        return [];
      }
    }
    // Fetch and populate related fields
    const allOrderRequests = await OrderRequestModel.find(filter)

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

    return allOrderRequests;
  }


  static async changeStatusToOrdered(orderRequestData, orderedById) {
    // Ensure that the status being passed is "Issued"
    if (orderRequestData.status !== "Ordered") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Status can only be changed to "Ordered"');
    }

    // Fetch the orderRequest by its id (provided in orderRequestData)
    const orderRequest = await OrderRequestModel.findById(orderRequestData._id);
    if (!orderRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order Request not found or cannot be modified");
    }
    if (orderRequest.status === "Ordered") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot change status to "Ordered" as it is already "Ordered"');
    }
    if (orderRequest.status !== "Approved") {
      throw new ApiError(httpStatus.BAD_REQUEST, `Cannot order Order Request with status: ${orderRequest.status}`);
    }


    const orderer = await UserModel.findById(orderedById);
    if (!orderer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Orderer not found");
    }

    // Update the orderRequest fields
    orderRequest.status = "Ordered";
    orderRequest.ordered_by = orderer._id;
    orderRequest.ordered_at = new Date();
    orderRequest.updatedAt = new Date(); // Optional if timestamps are enabled

    try {
      await orderRequest.save();
    } catch (error) {
      console.error("Error saving orderRequest:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to order orderRequest");
    }

    // Get the faculty (the user who requested the orderRequest)
    const faculty = await UserModel.findById(orderRequest.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Prepare notification details
    const message = `Order Request has been ordered.`;
    const expiryDate = new Date(orderRequest.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    await createNotification({
      userId: faculty._id,
      requisitionId: orderRequest._id,
      title: "Order Request Ordered",
      message,
      send_to: ["stores", "faculty", "admin"],
      type: "order_request_ordered",
      expiresAt: expiryDate,
    });

    return orderRequest;
  }

  static async changeStatusToIssued(orderRequestData, issuedById) {
    // Ensure that the status being passed is "Issued"
    if (orderRequestData.status !== "Issued") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Status can only be changed to "Issued"');
    }

    // Fetch the orderRequest by its id (provided in orderRequestData)
    const orderRequest = await OrderRequestModel.findById(orderRequestData._id);
    if (!orderRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order Request not found or cannot be modified");
    }


    const issuer = await UserModel.findById(issuedById);
    if (!issuer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Issuer not found");
    }

    // Update the orderRequest fields
    orderRequest.status = "Issued";


    try {
      await orderRequest.save();
    } catch (error) {
      console.error("Error saving orderRequest:", error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to issue orderRequest");
    }

    // Get the faculty (the user who requested the orderRequest)
    const faculty = await UserModel.findById(orderRequest.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Prepare notification details
    const message = `Order Request has been issued.`;
    const expiryDate = new Date(orderRequest.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    await createNotification({
      userId: faculty._id,
      requisitionId: orderRequest._id,
      title: "Order Request Issued",
      message,
      send_to: ["stores", "faculty", "admin"],
      type: "order_request_issued",
      expiresAt: expiryDate,
    });

    return orderRequest;
  }


}

module.exports = OrderRequestService;
