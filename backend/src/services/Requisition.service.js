const RequisitionModel = require("../models/requisition.models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const { createNotification } = require("../services/RequisitionNotification.service");
const UserModel = require("../models/user.models");
const ProjectModel = require("../models/project.models");
const mongoose = require('mongoose');
const ChemicalsModel = require('../models/chemicals.models');
const BooksModel = require('../models/books.models');
const GlasswaresModel = require('../models/glasswares.models');
const ConsumablesModel = require('../models/consumables.models');
const EquipmentsModel = require('../models/equipments.models');
const OthersModel = require('../models/others.models');
const PracticalModel = require('../models/practical.models');
const OtherModel = require('../models/other.models');
const GeneralModel = require('../models/general.models');
const ChemicalsService = require('./Chemicals.service');
const ConsumablesService = require('./Consumables.service');
const EquipmentsService = require('./Equipments.service');
const GlasswaresService = require('./Glasswares.service');
const BooksService = require('./Books.service');
const OthersService = require('./Others.service');
const { ReturnGlasswareLogItemById } = require("./Glasswares.service");
const { ReturnEquipmentLogItemById } = require("./Equipments.service");
const GlasswareLogModel = require('../models/glasswares.log.models');
const EquipmentLogModel = require('../models/equipments.log.models');
const BooksLogModel = require('../models/books.log.models');

// Helper to resolve an item code into its ObjectId based on its class.
// (This helper is used only if an item value isn’t already a valid ObjectId.)
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

const populateItemDetails = async (items) => {
  return Promise.all(items.map(async (reqItem) => {
    const ItemModel = modelMap[reqItem.class];
    if (!ItemModel) {
      console.warn(`Unknown item class: ${reqItem.class}`);
      return reqItem;
    }
    const itemDetails = await ItemModel.findById(reqItem.item).select('item_code item_name description');
    return {
      ...reqItem,
      itemDetails: itemDetails || null,
    };
  }));
};


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

  return category._id;
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

  const item = await ItemModel.findById(itemId).select('item_code item_name description unit_of_measure current_quantity remark');
  return item || null; // Return null if item not found
};

class RequisitionService {

  static async generateRequisitionCode() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Ensure MM format
    const prefix = `R-${year}${month}-`;

    // Find the latest requisition for the current month
    const lastRequisition = await RequisitionModel.findOne({
      requisition_code: { $regex: `^${prefix}` }, // Match codes for the current month
    })
      .sort({ requisition_code: -1 }) // Sort descending to get the latest
      .exec();

    let nextNumber = "001";
    if (lastRequisition) {
      const lastNumber = parseInt(lastRequisition.requisition_code.split("-")[2], 10);
      nextNumber = String(lastNumber + 1).padStart(3, "0"); // Increment and ensure 3-digit format
    }

    return `${prefix}${nextNumber}`;
  }

  // Create a new requisition
  static async createRequisition(requisitionData) {

    requisitionData.category = await getCategoryId(requisitionData.category, requisitionData.categoryType);


    // Find the requesting user by the provided requested_by id
    const user = await UserModel.findById(requisitionData.requested_by);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Build a notification message (using the number of items)
    const message = `Requisition with ${requisitionData.items.length} items has been requested by ${user.name}.`;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

    const requirementDate = new Date(requisitionData.date_of_requirement);
    requirementDate.setHours(0, 0, 0, 0); // Reset time for comparison

    if (requirementDate < today) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid date selection. The date of requirement must be today or a future date."
      );
    }

    // **Generate Requisition Code**
    requisitionData.requisition_code = await this.generateRequisitionCode();

    // Process each item in the items array:
    if (requisitionData.items && Array.isArray(requisitionData.items)) {
      for (let i = 0; i < requisitionData.items.length; i++) {
        const itemObj = requisitionData.items[i];
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

        // Check if the quantity required is available
        if (Number(itemObj.quantity_required) > Number(inventoryItem.current_quantity)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Insufficient quantity for item ${inventoryItem.item_name} in ${itemObj.class}. 
             Available: ${inventoryItem.current_quantity}, Requested: ${itemObj.quantity_required}`
          );
        }
        if (!inventoryItem) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Item not found for item id: ${itemObj.item}`
          );
        }

        // Check if the quantity required is less than or equal to the current available quantity.
        if (Number(itemObj.quantity_required) > Number(inventoryItem.current_quantity)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Insufficient quantity for item ${inventoryItem.item_name}. Quantity Available: ${inventoryItem.current_quantity}, You Requested: ${itemObj.quantity_required}`
          );
        }

      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Items array is required");
    }

    // Create the new requisition document
    const newRequisition = await RequisitionModel.create(requisitionData);

    // Calculate the expiry date (1 day after the date_of_requirement)
    const expiryDate = new Date(requisitionData.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    try {
      await createNotification({
        userId: user._id,
        requisitionId: newRequisition._id,
        title: "Requisition Created",
        message: message,
        send_to: ["admin", "manager"],
        type: "requisition_created",
        expiresAt: expiryDate,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    return newRequisition;
  }

  // Retrieve all requisitions with optional search filters
  static async getAllRequisitions(searchParams = {}) {
    const filter = {};

    // ✅ Requisition Code
    if (searchParams.requisition_code) {
      filter.requisition_code = { $regex: searchParams.requisition_code, $options: "i" };
    }
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
    }

    // ✅ Status Filter
    if (searchParams.status) {
      filter.status = searchParams.status;
    } else {
      filter.status = { $in: ['Pending', 'Approved', 'Rejected', 'Issued', 'Return'] };
    }

    // ✅ Date of Requirement Filter
    if (searchParams.date_of_requirement) {
      const date = new Date(searchParams.date_of_requirement);
      filter.date_of_requirement = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }


    // ✅ Requested By Filter
    if (searchParams.requested_by) {
      const requestedBy = await UserModel.findOne({
        $or: [
          { name: { $regex: searchParams.requested_by, $options: 'i' } },
          { email: { $regex: searchParams.requested_by, $options: 'i' } }
        ]
      });

      if (!requestedBy) {
        console.log(`Requested by '${searchParams.requested_by}' not found.`);
        return []; // No user found
      }

      filter.requested_by = requestedBy._id;
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

    // ✅ Fetch Requisitions (without items populated yet)
    const allRequisitions = await RequisitionModel.find(filter)
      .populate({
        path: 'requested_by',
        select: 'name email',
      })
      .populate({
        path: 'approved_by',
        select: 'name email',
      })
      .populate({
        path: 'issued_by',
        select: 'name email',
      });

    const enrichedRequisitions = await Promise.all(allRequisitions.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;

      if (model && req.category) {
        const category = await model.findById(req.category);
        const codeField = codeFieldMap[req.categoryType];
        if (category && codeField) categoryCode = category[codeField];
      }

      // 🔁 Enrich items with item_code and item_name (REMOVE `item: id`)
      const enrichedItems = await Promise.all(req.items.map(async (item) => {
        const modelMap = {
          'Chemical': ChemicalsModel,
          'Book': BooksModel,
          'Glassware': GlasswaresModel,
          'Consumable': ConsumablesModel,
          'Equipment': EquipmentsModel,
          'Other': OthersModel,
          'Chemicals': ChemicalsModel, // add plural keys if used elsewhere
          'Books': BooksModel,
          'Glasswares': GlasswaresModel,
          'Consumables': ConsumablesModel,
          'Equipments': EquipmentsModel,
          'Others': OthersModel
        };

        const ItemModel = modelMap[item.class];
        if (!ItemModel) return item.toObject(); // fallback

        const itemDetails = await ItemModel.findById(item.item).select('item_code item_name');
        return {
          _id: item._id,
          class: item.class,
          description: item.description,
          unit_of_measure: item.unit_of_measure,
          quantity_required: item.quantity_required,
          quantity_returned: item.quantity_returned,
                    quantity_issued: item.quantity_issued,
              quantity_lost_damaged: item.quantity_lost_damaged,
          current_quantity: item.current_quantity,
          item_code: itemDetails?.item_code || '',
          item_name: itemDetails?.item_name || ''
        };
      }));

      return {
        ...req.toObject(),
        categoryCode,
        items: enrichedItems  // 👈 overwrite raw `items`
      };
    }));

    return enrichedRequisitions;



  }


  static async updateRequisition(requisitionId, updateData, facultyEmail) {
    if (updateData.categoryCode) {
      updateData.category = updateData.categoryCode;
      delete updateData.categoryCode;
    }

    // Validate that updateData exists
    if (!updateData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No update data provided");
    }

    // Step 1: Find faculty by email
    const faculty = await UserModel.findOne({ email: facultyEmail });
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Step 2: Find the requisition that matches the requisitionId and faculty email
    const existingRequisition = await RequisitionModel.findOne({
      _id: requisitionId,
      requested_by: faculty._id,
    });

    if (!existingRequisition) {
      throw new ApiError(httpStatus.NOT_FOUND, "Requisition not found");
    }

    // Step 3: Handle different status update cases
    if (existingRequisition.status === "Approved" || existingRequisition.status === "Rejected") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Approved or Rejected requests cannot be updated. Please make a new request"
      );
    } else if (existingRequisition.status === "Issued") {
      // Only allow update if changing status to "Return"
      if (updateData.status !== "Return") {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "For issued requisitions, the only allowed update is to mark as 'Return'"
        );
      }

      // Validate that an items array is provided with at least one valid quantity_returned
      if (!updateData.items || !Array.isArray(updateData.items) || updateData.items.length === 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Items array must be provided for a return update"
        );
      }

      let validReturn = false;
      for (const item of updateData.items) {
        if (typeof item.quantity_returned === 'number' && item.quantity_returned > 0) {
          validReturn = true;
          break;
        }
      }
      if (!validReturn) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "At least one item must have a quantity_returned greater than zero when marking a requisition as 'Return'"
        );
      }
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


        // Check if the quantity required is less than or equal to the current available quantity.
        if (Number(itemObj.quantity_required) > Number(inventoryItem.current_quantity)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Insufficient quantity for item ${inventoryItem.item_name}. Quantity Available: ${inventoryItem.current_quantity}, You Requested: ${itemObj.quantity_required}`
          );
        }
      }
    }

    // Step 5: Update the requisition in the database
    const requisition = await RequisitionModel.findOneAndUpdate(
      { _id: requisitionId, requested_by: faculty._id },
      updateData,
      { new: true }
    );

    if (!requisition) {
      throw new ApiError(httpStatus.NOT_FOUND, "Requisition update failed or not found");
    }

    // Step 6: Prepare and send notifications
    let title = "Requisition Updated";
    let notificationType = "requisition_update";
    let message = `Requisition has been updated by ${faculty.name}.`;

    if (updateData.status === "Return") {
      title = "Requisition Returned";
      notificationType = "requisition_return";
      message = `Requisition has been marked as returned by ${faculty.name}.`;
    }

    const expiryDate = new Date(requisition.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);



    try {
      await createNotification({
        userId: faculty._id,
        requisitionId: requisition._id,
        title,
        message,
        send_to: ["admin", "manager"], // Assuming admin is notified for all requisition updates
        type: notificationType,
        expiresAt: expiryDate,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    return requisition;
  }


  // Delete a requisition (only if it is still Pending)
  static async deleteRequisition(requisitionId, userId) {
    const deletedRequisition = await RequisitionModel.findOneAndDelete({
      _id: requisitionId,
      requested_by: userId,
      status: "Pending",
    }).populate("items.item", "item_name");

    if (!deletedRequisition) {
      throw new ApiError(httpStatus.NOT_FOUND, "Requisition not found or cannot be deleted");
    }

    const faculty = await UserModel.findById(userId);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const message = `Requisition has been deleted by ${faculty.name}.`;

    const expiryDate = new Date(deletedRequisition.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    await createNotification({
      userId: faculty._id,
      requisitionId: deletedRequisition._id,
      title: "Requisition Deleted",
      message,
      send_to: ["admin", "manager"],
      type: "requisition_delete",
      expiresAt: expiryDate,
    });

    return deletedRequisition;
  }

  static async getUserReturnRequisition(userEmail, searchParams = {}) {
    const filter = { status: { $in: ["Issued", "Return"] } };

    if (searchParams.requisition_code) {
      filter.requisition_code = { $regex: searchParams.requisition_code, $options: "i" };
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
        // Filter requisitions where requested_by is in the list of matching user IDs.
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
      filter.status = { $in: ['Issued', 'Return'] };
    }

    // Date filter: search by date_of_requirement (covering the entire day)
    if (searchParams.date_of_requirement) {
      const date = new Date(searchParams.date_of_requirement);
      filter.date_of_requirement = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }


    // ✅ Category Filter
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;
      if (searchParams.categoryCode) {
        filter.category = await getCategoryId(searchParams.categoryCode, searchParams.categoryType);
      }
    }

    // Item filter: search in the nested items array by item_code
    if (searchParams.item) {
      const modelMap = {
        'Chemicals': ChemicalsModel,
        'Books': BooksModel,
        'Glasswares': GlasswaresModel,
        'Consumables': ConsumablesModel,
        'Equipments': EquipmentsModel,
        'Others': OthersModel,
      };

      let item = null;

      // Search for the item in all models
      for (const [className, Model] of Object.entries(modelMap)) {
        item = await Model.findOne({ item_code: { $regex: `^${searchParams.itemCode}$`, $options: 'i' } });
        if (item) {
          query.item = item._id;
          query.class = className; // Store the class if needed
          break; // Stop searching if item is found
        }
      }

      if (!item) return []; // No matching item, return empty array
    }

    // Fetch and populate related fields
    const userRequisitions = await RequisitionModel.find(filter)
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
        path: 'issued_by',
        select: 'name email',
        model: UserModel,
      });

    // Fetch full item details dynamically
    await Promise.all(userRequisitions.map(async (inward) => {
      if (userRequisitions.class && userRequisitions.item) {

        userRequisitions.item = await getItemDetails(userRequisitions.item, userRequisitions.class);
      }
    }));

    const enrichedRequisitions = await Promise.all(userRequisitions.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;

      if (model && req.category) {
        const category = await model.findById(req.category);
        const codeField = codeFieldMap[req.categoryType];
        if (category && codeField) categoryCode = category[codeField];
      }

      // 🔁 Enrich items with item_code and item_name (REMOVE `item: id`)
      const enrichedItems = await Promise.all(req.items.map(async (item) => {
        const modelMap = {
          'Chemical': ChemicalsModel,
          'Book': BooksModel,
          'Glassware': GlasswaresModel,
          'Consumable': ConsumablesModel,
          'Equipment': EquipmentsModel,
          'Other': OthersModel,
          'Chemicals': ChemicalsModel, // add plural keys if used elsewhere
          'Books': BooksModel,
          'Glasswares': GlasswaresModel,
          'Consumables': ConsumablesModel,
          'Equipments': EquipmentsModel,
          'Others': OthersModel
        };

        const ItemModel = modelMap[item.class];
        if (!ItemModel) return item.toObject(); // fallback

        const itemDetails = await ItemModel.findById(item.item).select('item_code item_name');
        return {
          _id: item._id,
          class: item.class,
          description: item.description,
          unit_of_measure: item.unit_of_measure,
          quantity_required: item.quantity_required,
          quantity_returned: item.quantity_returned,
          current_quantity: item.current_quantity,
          item_code: itemDetails?.item_code || '',
          item_name: itemDetails?.item_name || ''
        };
      }));

      return {
        ...req.toObject(),
        categoryCode,
        items: enrichedItems  // 👈 overwrite raw `items`
      };
    }));

    return enrichedRequisitions;

  }

  static async getUserRequisition(userEmail, searchParams = {}) {
    const filter = {};

    if (searchParams.requisition_code) {
      filter.requisition_code = { $regex: searchParams.requisition_code, $options: "i" };
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
        // Filter requisitions where requested_by is in the list of matching user IDs.
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
      filter.status = { $in: ['Pending', 'Approved', 'Rejected', 'Issued', 'Return'] };
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
      const modelMap = {
        'Chemicals': ChemicalsModel,
        'Books': BooksModel,
        'Glasswares': GlasswaresModel,
        'Consumables': ConsumablesModel,
        'Equipments': EquipmentsModel,
        'Others': OthersModel,
      };

      let item = null;

      // Search for the item in all models
      for (const [className, Model] of Object.entries(modelMap)) {
        item = await Model.findOne({ item_code: { $regex: `^${searchParams.itemCode}$`, $options: 'i' } });
        if (item) {
          query.item = item._id;
          query.class = className; // Store the class if needed
          break; // Stop searching if item is found
        }
      }

      if (!item) return []; // No matching item, return empty array
    }

    // Fetch and populate related fields
    const userRequisitions = await RequisitionModel.find(filter)

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
        path: 'issued_by',
        select: 'name email',
        model: UserModel,
      });

    const enriched = await Promise.all(userRequisitions.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;

      if (model && req.category) {
        const category = await model.findById(req.category);
        const codeField = codeFieldMap[req.categoryType];
        if (category && codeField) categoryCode = category[codeField];
      }

      // Enrich each item with item_code and item_name
      const enrichedItems = await Promise.all(req.items.map(async (item) => {
        const itemDetails = await getItemDetails(item.item, item.class);
        return {
          class: item.class,
          unit_of_measure: item.unit_of_measure,
          quantity_required: item.quantity_required,
          description: item.description,
          current_quantity: item.current_quantity,
          quantity_returned: item.quantity_returned,
          item_code: itemDetails?.item_code || '',
          item_name: itemDetails?.item_name || '',
          remark: item.remark || '',
          quantity_issued: item.quantity_issued || 0,
          quantity_lost_damaged: item.quantity_lost_damaged || 0, 
          
        };
      }));

      return {
        ...req.toObject(),
        categoryCode,
        items: enrichedItems,
      };
    }));

    // ✅ Final return
    return enriched;


  }


  static async approveRequisition(approvedbyId, data) {

    const allowedStatuses = ["Approved", "Rejected"];
    if (!allowedStatuses.includes(data.status)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status");
    }

    // Fetch the requisition
    const requisition = await RequisitionModel.findById(data.id);
    if (!requisition) {
      throw new ApiError(httpStatus.NOT_FOUND, "Requisition not found");
    }

    // Look up the admin user by their _id (approved_by should be an ObjectId)
    const admin = await UserModel.findById(approvedbyId);
    if (!admin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
    }

    // Get the user who requested the requisition
    const faculty = await UserModel.findById(requisition.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const updatedItems = requisition.items.map((item) => {
      const itemRemark = data.items.find((dataItem) => dataItem.item_id.toString() === item._id.toString())?.remark || ''; // Use item_id instead of _id
      item.remark = itemRemark;
      return item;
    });


    // Update the requisition status and other fields (including item remarks)
    const updatedRequisition = await RequisitionModel.findOneAndUpdate(
      { _id: data.id },
      {
        status: data.status,
        approved_by: admin._id,  // Use admin._id for ObjectId
        approved_at: data.approved_at || new Date(),
        remark: data.remark || '',  // Ensure we handle optional general remark
        items: updatedItems,  // Update the items with their specific remarks
      },
      { new: true }  // Return the updated requisition
    );

    if (!updatedRequisition) {
      throw new ApiError(httpStatus.NOT_FOUND, "Requisition not found or cannot be modified");
    }

    // Prepare the notification message
    const message = `Requisition has been ${data.status} by ${admin.name}.`;  // Use data.status here

    // Determine recipients based on the user's role
    const sendToRoles = faculty.roles.includes("faculty") ? ["faculty"] : ["lab-assistant"];

    // Expiry date for the notification
    const expiryDate = new Date(requisition.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);  // Set expiry date to 1 day after the required date

    // Create notification based on the status
    if (data.status === "Approved") {
      await createNotification({
        userId: faculty._id,
        requisitionId: updatedRequisition._id,
        title: `Requisition ${data.status}`,
        message,
        send_to: [...sendToRoles, "lab-assistant"],
        type: "requisition_approved",
        expiresAt: expiryDate,
      });
    } else if (data.status === "Rejected") {
      await createNotification({
        userId: faculty._id,
        requisitionId: updatedRequisition._id,
        title: `Requisition ${data.status}`,
        message,
        send_to: sendToRoles,
        type: "requisition_rejected",
        expiresAt: expiryDate,
      });
    }

    return updatedRequisition;  // Return the updated requisition
  }

  static async getApprovedRequisitions(searchParams = {}) {
    const filter = { status: { $in: ["Approved"] } };

    if (searchParams.requisition_code) {
      filter.requisition_code = { $regex: searchParams.requisition_code, $options: "i" };
    }

    // Date filter: Ensure correct date range is applied
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
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;

    }

    // Item filter: search in the nested items array by item_code
    if (searchParams.item) {
      const modelMap = {
        'Chemicals': ChemicalsModel,
        'Books': BooksModel,
        'Glasswares': GlasswaresModel,
        'Consumables': ConsumablesModel,
        'Equipments': EquipmentsModel,
        'Others': OthersModel,
      };

      let item = null;

      // Search for the item in all models
      for (const [className, Model] of Object.entries(modelMap)) {
        item = await Model.findOne({ item_code: { $regex: `^${searchParams.itemCode}$`, $options: 'i' } });
        if (item) {
          query.item = item._id;
          query.class = className; // Store the class if needed
          break; // Stop searching if item is found
        }
      }

      if (!item) return []; // No matching item, return empty array
    }

    // Fetch and populate related fields
    const allRequisitions = await RequisitionModel.find(filter)

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
        path: 'issued_by',
        select: 'name email',
        model: UserModel,
      });

    await Promise.all(allRequisitions.map(async (req) => {
      req.items = await Promise.all(req.items.map(async (itemEntry) => {
        if (itemEntry.item && itemEntry.class) {
          const itemDetails = await getItemDetails(itemEntry.item, itemEntry.class);
          return {
            ...itemEntry.toObject(),
            item_name: itemDetails?.item_name || '',
            item_code: itemDetails?.item_code || '',
          };
        }
        return itemEntry;
      }));
    }));

    const enriched = await Promise.all(allRequisitions.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;

      if (model && req.category) {
        const category = await model.findById(req.category);
        const codeField = codeFieldMap[req.categoryType];
        if (category && codeField) categoryCode = category[codeField];
      }

      return { ...req.toObject(), categoryCode, items: req.items };
    }));

    return enriched;
  }

  static async getApprovedandIssuedRequisitions(searchParams = {}) {
    const filter = { status: { $in: ["Approved", "Issued"] } };

    if (searchParams.requisition_code) {
      filter.requisition_code = { $regex: searchParams.requisition_code, $options: "i" };
    }

    // Date filter: Ensure correct date range is applied
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
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;

    }
    // Item filter: search in the nested items array by item_code

    // Item filter: search in the nested items array by item_code
    if (searchParams.item) {
      const modelMap = {
        'Chemicals': ChemicalsModel,
        'Books': BooksModel,
        'Glasswares': GlasswaresModel,
        'Consumables': ConsumablesModel,
        'Equipments': EquipmentsModel,
        'Others': OthersModel,
      };

      let item = null;

      // Search for the item in all models
      for (const [className, Model] of Object.entries(modelMap)) {
        item = await Model.findOne({ item_code: { $regex: `^${searchParams.itemCode}$`, $options: 'i' } });
        if (item) {
          query.item = item._id;
          query.class = className; // Store the class if needed
          break; // Stop searching if item is found
        }
      }

      if (!item) return []; // No matching item, return empty array
    }

    // Fetch and populate related fields
    const allRequisitions = await RequisitionModel.find(filter)
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
        path: 'issued_by',
        select: 'name email',
        model: UserModel,
      });

    await Promise.all(allRequisitions.map(async (req) => {
      req.items = await Promise.all(req.items.map(async (itemEntry) => {
        if (itemEntry.item && itemEntry.class) {
          const itemDetails = await getItemDetails(itemEntry.item, itemEntry.class);
          return {
            ...itemEntry.toObject(),
      
            item_name: itemDetails?.item_name || '',
            item_code: itemDetails?.item_code || '',
          };
        }
        return itemEntry;
      }));
    }));

    const enrichedRequisitions = await Promise.all(allRequisitions.map(async (req) => {
      const model = categoryModelMap[req.categoryType];
      let categoryCode = null;

      if (model && req.category) {
        const category = await model.findById(req.category);
        const codeField = codeFieldMap[req.categoryType];
        if (category && codeField) categoryCode = category[codeField];
      }

      // 🔁 Enrich items with item_code and item_name (REMOVE `item: id`)
      const enrichedItems = await Promise.all(req.items.map(async (item) => {
        const modelMap = {
          'Chemical': ChemicalsModel,
          'Book': BooksModel,
          'Glassware': GlasswaresModel,
          'Consumable': ConsumablesModel,
          'Equipment': EquipmentsModel,
          'Other': OthersModel,
          'Chemicals': ChemicalsModel, // add plural keys if used elsewhere
          'Books': BooksModel,
          'Glasswares': GlasswaresModel,
          'Consumables': ConsumablesModel,
          'Equipments': EquipmentsModel,
          'Others': OthersModel
        };

        const ItemModel = modelMap[item.class];
        if (!ItemModel) return item.toObject(); // fallback

        const itemDetails = await ItemModel.findById(item.item).select('item_code item_name');
        return {
  _id: item._id,
  item: item.item, 
  class: item.class,
  description: item.description,
  unit_of_measure: item.unit_of_measure,
  quantity_required: item.quantity_required,
  quantity_returned: item.quantity_returned,
    quantity_issued: item.quantity_issued,
  current_quantity: item.current_quantity,
  remark: item.remark || '', // Add remark if available
  item_code: itemDetails?.item_code || '',
  item_name: itemDetails?.item_name || '',
  date_issued: item.date_issued || null, // Add date_issued if available
  issued_by: item.issued_by || null // Add issued_by if available
};
      }));

      return {
        ...req.toObject(),
        categoryCode,
        items: enrichedItems  // 👈 overwrite raw `items`
      };
    }));

    return enrichedRequisitions;

  }


  static async changeStatusToIssued(requisitionData, issuedById) {
    for (const item of requisitionData.items) {
  console.log("Received item in request:", item);
}

    // Ensure that the status being passed is "Issued"
    if (requisitionData.status !== "Issued") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Status can only be changed to "Issued"');
    }

    // Fetch the requisition by its id (provided in requisitionData)
    const requisition = await RequisitionModel.findById(requisitionData._id);
    if (!requisition) {
      throw new ApiError(httpStatus.NOT_FOUND, "Requisition not found or cannot be modified");
    }
    if (requisition.status === "Issued") {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot change status to "Issued" as it is already "Issued"');
    }
    if (requisition.status !== "Approved") {
      throw new ApiError(httpStatus.BAD_REQUEST, `Cannot issue requisition with status: ${requisition.status}`);
    }

    // Find the issuing user by their _id (using findById)
    const issuer = await UserModel.findById(issuedById);
    if (!issuer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Issuing user not found");
    }
// Update quantity_issued for items in DB with incoming values
for (const reqItem of requisitionData.items) {
  const matchedItem = requisition.items.find(dbItem => 
    dbItem.item.toString() === (reqItem.item_id || reqItem.item)
  );
  if (matchedItem) {
    matchedItem.quantity_issued = Number(reqItem.quantity_issued); // cast if needed
  }
}

// Update requisition status fields
requisition.status = "Issued";
requisition.issued_by = issuer._id;
requisition.issued_at = new Date();
requisition.updatedAt = new Date();

try {
  await requisition.save();

  const issuedDate = requisition.issued_at;
  const requestModel = "Requisition";
  const userEmail = issuer.email;

  for (const item of requisition.items) {
    const { item: item_id, class: itemClass, quantity_issued } = item;
    console.log(`Processing item: id=${item_id}, class=${itemClass}, quantity_issued=${quantity_issued}`);

    if (!item_id || !itemClass) {
      console.warn('Skipping item due to missing id or class');
      continue;
    }

    const issuedQtyNum = Number(quantity_issued);
    if (isNaN(issuedQtyNum) || issuedQtyNum <= 0) {
      console.warn('Skipping item due to invalid issued quantity:', quantity_issued);
      continue;
    }

    const logPayload = {
      item_id,
      request_model: requestModel,
      request: requisition._id,
      issued_quantity: issuedQtyNum,
      date_issued: issuedDate,
      user_email: userEmail,
    };

    console.log(`Calling LogIssuedQuantity for class: ${itemClass.toLowerCase()}`, logPayload);

    switch (itemClass.toLowerCase()) {
      case "chemicals":
        await ChemicalsService.LogIssuedQuantity(...Object.values(logPayload));
        break;
      case "consumables":
        await ConsumablesService.LogIssuedQuantity(...Object.values(logPayload));
        break;
      case "equipments":
        await EquipmentsService.LogIssuedQuantity(...Object.values(logPayload));
        break;
      case "glasswares":
        await GlasswaresService.LogIssuedQuantity(...Object.values(logPayload));
        break;
      case "books":
        await BooksService.LogIssuedQuantity(...Object.values(logPayload));
        break;
         case "others":
        await OthersService.LogIssuedQuantity(...Object.values(logPayload));
        break;
      default:
        console.warn(`Unknown item class: ${itemClass.toLowerCase()}`);
    }
  }
} catch (error) {
  console.error("Error saving requisition or logging issued quantity:", error);
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to issue requisition");
}

    // Get the faculty (the user who requested the requisition)
    const faculty = await UserModel.findById(requisition.requested_by);
    if (!faculty) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Prepare notification details
    const message = `Requisition has been issued.`;
    const expiryDate = new Date(requisition.date_of_requirement);
    expiryDate.setDate(expiryDate.getDate() + 1);

    await createNotification({
      userId: faculty._id,
      requisitionId: requisition._id,
      title: "Requisition Issued",
      message,
      send_to: ["lab-assistant", "faculty", "admin"],
      type: "requisition_issued",
      expiresAt: expiryDate,
    });

    return requisition;
  }

  static async UpdateItemReturnQuantity(Model, itemId, quantityReturned) {
  const item = await Model.findById(itemId);
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Item not found");
  item.current_quantity += quantityReturned;
  await item.save();
}

static async UpdateBookLogReturnDate(logId, dateReturned) {
  if (!mongoose.Types.ObjectId.isValid(logId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid log ID");
  }

  const log = await BooksLogModel.findById(logId);
  if (!log) throw new ApiError(httpStatus.NOT_FOUND, "Book log not found");

  if (!dateReturned || isNaN(new Date(dateReturned).getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date returned");
  }

  log.date_return = new Date(dateReturned);
  await log.save();
}

  static async returnRequisition(data) {
  const allowedStatuses = ["Return"];
  if (!allowedStatuses.includes(data.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status");
  }

  const requisition = await RequisitionModel.findById(data.id);
  if (!requisition) {
    throw new ApiError(httpStatus.NOT_FOUND, "Requisition not found");
  }

  const faculty = await UserModel.findById(requisition.requested_by);
  if (!faculty) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Items array must be provided");
  }

  const validReturn = data.items.some(
    (item) => typeof item.quantity_returned === "number" && item.quantity_returned > 0
  );
  if (!validReturn) {
    throw new ApiError(httpStatus.BAD_REQUEST, "At least one item must have quantity_returned > 0");
  }

for (const itemData of data.items) {
  const reqItem = requisition.items.find(
    (i) => i._id.toString() === itemData.item_id.toString()
  );
  if (!reqItem) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Item ${itemData.item_id} not found in requisition`);
  }

  const { class: itemClass, item: itemId } = reqItem;

  if (itemData.quantity_returned > reqItem.quantity_required) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Returned quantity exceeds required for item ${itemId}`);
  }

  // 🔍 Fetch the related log entry using request + model
  let logEntry = null;
  if (["Glasswares", "Equipments", "Books"].includes(itemClass)) {
    const LogModel =
      itemClass === "Glasswares"
        ? GlasswareLogModel
        : itemClass === "Equipments"
        ? EquipmentLogModel
        : BooksLogModel;

    logEntry = await LogModel.findOne({
      request: requisition._id,
      request_model: "Requisition",
      item: itemId,
    });

    if (!logEntry) {
      throw new ApiError(httpStatus.NOT_FOUND, `Log entry not found for ${itemClass} with item ${itemId}`);
    }
  }

  switch (itemClass) {
    case "Glasswares":
      await ReturnGlasswareLogItemById(
        logEntry._id,
        itemData.quantity_returned,
        itemData.quantity_lost_damaged || 0,
        itemData.date_returned
      );
      break;

    case "Equipments":
      await ReturnEquipmentLogItemById(
        logEntry._id,
        itemData.quantity_returned,
        itemData.quantity_lost_damaged || 0,
        itemData.date_returned
      );
      break;

    case "Books":
      await this.UpdateBookLogReturnDate(logEntry._id, itemData.date_returned);
      break;

    case "Chemicals":
      await this.UpdateItemReturnQuantity(ChemicalsModel, itemId, itemData.quantity_returned);
      break;

    case "Consumables":
      await this.UpdateItemReturnQuantity(ConsumablesModel, itemId, itemData.quantity_returned);
      break;

    case "Others":
      await this.UpdateItemReturnQuantity(OthersModel, itemId, itemData.quantity_returned);
      break;

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, `Unsupported class: ${itemClass}`);
  }

  // Store return info in requisition
  reqItem.quantity_returned = itemData.quantity_returned;
  if (itemData.quantity_lost_damaged !== undefined)
    reqItem.quantity_lost_damaged = itemData.quantity_lost_damaged;
  if (itemData.date_returned) reqItem.date_returned = new Date(itemData.date_returned);
}


  requisition.status = data.status;
  await requisition.save();

  const expiryDate = new Date(requisition.date_of_requirement);
  expiryDate.setDate(expiryDate.getDate() + 1);

  await createNotification({
    userId: faculty._id,
    requisitionId: requisition._id,
    title: `Requisition ${data.status}`,
    message: `Requisition has been ${data.status} by ${faculty.name}.`,
    send_to: ["admin", "manager", "chemistry"],
    type: "requisition_return",
    expiresAt: expiryDate,
  });

  return requisition;
}






  // Retrieve requisitions with status "Return"
  static async getReturnRequisitions(searchParams = {}) {
    const query = { status: "Return" };

    if (searchParams.requisition_code) {
      query.requisition_code = { $regex: searchParams.requisition_code, $options: "i" };
    }
    if (searchParams.categoryType) {
      filter.categoryType = searchParams.categoryType;

    }


    if (searchParams.item_name) {
      query["items.description"] = { $regex: searchParams.item_name, $options: "i" };
    }
    if (searchParams.faculty_email) {
      const faculty = await UserModel.findOne({ email: searchParams.faculty_email });
      if (faculty) {
        query.requested_by = faculty._id;
      }
    }
    if (searchParams.date_of_requirement) {
      query.date_of_requirement = new Date(searchParams.date_of_requirement);
    }

    const requisitions = await RequisitionModel.find(query)
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
        path: 'issued_by',
        select: 'name email',
        model: UserModel,
      });

    await Promise.all(requisitions.map(async (req) => {
      req.items = await Promise.all(req.items.map(async (itemEntry) => {
        if (itemEntry.item && itemEntry.class) {
          const itemDetails = await getItemDetails(itemEntry.item, itemEntry.class);
          return {
            ...itemEntry.toObject(),
            item_name: itemDetails?.item_name || '',
            item_code: itemDetails?.item_code || '',
          };
        }
        return itemEntry;
      }));
    }));

   const enrichedRequisitions = await Promise.all(requisitions.map(async (req) => {
  const model = categoryModelMap[req.categoryType];
  let categoryCode = null;

  if (model && req.category) {
    const category = await model.findById(req.category);
    const codeField = codeFieldMap[req.categoryType];
    if (category && codeField) categoryCode = category[codeField];
  }

  // 🔁 Enrich items with item_code and item_name (REMOVE `item: id`)
  const enrichedItems = await Promise.all(req.items.map(async (item) => {
    const modelMap = {
      'Chemical': ChemicalsModel,
      'Book': BooksModel,
      'Glassware': GlasswaresModel,
      'Consumable': ConsumablesModel,
      'Equipment': EquipmentsModel,
      'Other': OthersModel,
      'Chemicals': ChemicalsModel, // add plural keys if used elsewhere
      'Books': BooksModel,
      'Glasswares': GlasswaresModel,
      'Consumables': ConsumablesModel,
      'Equipments': EquipmentsModel,
      'Others': OthersModel
    };

    const ItemModel = modelMap[item.class];
    if (!ItemModel) return item.toObject(); // fallback

    const itemDetails = await ItemModel.findById(item.item).select('item_code item_name');
    return {
      _id: item._id,
      class: item.class,
      description: item.description,
      unit_of_measure: item.unit_of_measure,
      quantity_required: item.quantity_required,
      quantity_returned: item.quantity_returned,
      current_quantity: item.current_quantity,
      item_code: itemDetails?.item_code || '',
      item_name: itemDetails?.item_name || ''
    };
  }));

  return {
    ...req.toObject(),
    categoryCode,
    items: enrichedItems  // 👈 overwrite raw `items`
  };
}));

return enrichedRequisitions;


}
}
module.exports = RequisitionService;
