const httpStatus = require("http-status");
const {
  EquipmentsModel,
  EquipmentsLogModel,
  EquipmentsRestockModel,
  InwardsModel,
  OrderRequestModel,
  NewIndent,
  RequisitionModel,
} = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const StockNotificationService = require("../services/stockNotification.service");

class EquipmentsService {
  static async RegisterEquipmentItem(user, body) {
    const {
      item_name,
      manual,
      model_number,
      serial_number,
      company,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
    } = body;

   // Extract the first 3 letters of the item_name in uppercase
       const itemCodePrefix = item_name.slice(0, 3).toUpperCase();
     
       // Find the last item with the same prefix
       const lastItem = await EquipmentsModel.findOne({
         item_code: { $regex: `^${itemCodePrefix}-\\d{4,5}$` },
       })
         .sort({ item_code: -1 })
         .exec();
     
       let nextNumber = 1001; // Start from 1001
       if (lastItem) {
         const lastItemCode = lastItem.item_code;
         const lastNumber = parseInt(lastItemCode.split("-")[1], 10);
         if (!isNaN(lastNumber)) {
           nextNumber = lastNumber + 1;
         }
       }
     
    const item_code = `${itemCodePrefix}-${nextNumber}`;
    const total_quantity = 0;
    const current_quantity = 0;

    const equipment = await EquipmentsModel.create({
      item_code,
      item_name,
      manual,
      model_number,
      serial_number,
      company,
      purpose,
      total_quantity,
      current_quantity,
      min_stock_level,
      unit_of_measure,
      description,
      status: current_quantity > min_stock_level ? "In Stock" : "Low Stock",
      user,
    });

    return { msg: "Equipment item added successfully!", equipment };
  }

  static async GetAllItems(filters = {}) {
    const query = {}; // Initialize an empty query object

    // Add individual fields to the query object if they are present in the filters
    if (filters.item_code) query.item_code = { $regex: filters.item_code, $options: "i" };
    if (filters.item_name) query.item_name = { $regex: filters.item_name, $options: "i" };
    if (filters.serial_number) query.serial_number = { $regex: filters.serial_number, $options: "i" };
    if (filters.model_number) query.model_number = { $regex: filters.model_number, $options: "i" };
    if (filters.company) query.company = { $regex: filters.company, $options: "i" };
    if (filters.status) query.status = { $regex: filters.status, $options: "i" };
    if (filters.purpose) query.purpose = { $regex: filters.purpose, $options: "i" };
    if (filters.unit_of_measure) query.unit_of_measure = { $regex: filters.unit_of_measure, $options: "i" };
    if (filters.description) query.description = { $regex: filters.description, $options: "i" };

    const data = await EquipmentsModel.find(query).select(
      "item_code item_name serial_number model_number manual company createdAt purpose total_quantity current_quantity min_stock_level unit_of_measure updatedAt status description"
    );

    const totalEquipments = data.length;

    // Now, check if notifications need to be deleted for out-of-stock or low-stock items
    for (const item of data) {
      try {
        // If the item is no longer Out of Stock, delete the "Out of Stock" notification
        if (item.current_quantity > 0) {
          const result = await StockNotificationService.deleteMany({
            itemId: item._id,
            type: "out_of_stock",
          });
        }

        // If the item is no longer Low Stock, delete the "Low Stock" notification
        if (item.current_quantity > item.min_stock_level) {
          const result = await StockNotificationService.deleteMany({
            itemId: item._id,
            type: "low_stock",
          });
        }
      } catch (error) {
        console.error(`Error deleting notifications for item: ${item.item_name}`, error);
      }
    }

    return {
      items: data,
      total: totalEquipments,
    };
  }


  static async GetLogs(filters) {
    console.log("filters: ", filters);
    const query = {};

    // Construct OR query for item_code and item_name
    let equipmentQuery = [];

    if (filters.item_code) {
        equipmentQuery.push({ item_code: { $regex: filters.item_code, $options: "i" } });
    }
    if (filters.item_name) {
        equipmentQuery.push({ item_name: { $regex: filters.item_name, $options: "i" } });
    }

    if (equipmentQuery.length > 0) {
        const equipment = await EquipmentsModel.findOne({ $or: equipmentQuery }).select("_id");

        if (!equipment) {
            console.log("No matching equipment found for given item_code or item_name");
            return []; // Exit early to prevent incorrect logs from being returned
        }
        
        query.item = equipment._id;
    }

    // Use regex for partial match on user_email (only if provided)
    if (filters.user_email && filters.user_email.trim() !== "") {
        query.user_email = { $regex: filters.user_email, $options: "i" };
    }

    // Filter by date_issued (only if provided)
    if (filters.date_issued && filters.date_issued.trim() !== "") {
        const startOfDay = new Date(filters.date_issued);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date_issued);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query.date_issued = { $gte: startOfDay, $lte: endOfDay };
    }

    // Fetch logs
    let logs = await EquipmentsLogModel.find(query)
        .populate("item", "item_code item_name current_quantity")
        .sort({ date_issued: -1 });

    // Process logs to get request_code based on request_model
    logs = await Promise.all(
        logs.map(async (log) => {
            if (log.request && (log.request_model).toLowerCase()) {
                log = log.toObject(); // Convert Mongoose document to plain object
                let requestCode = null;

                console.log(`Processing log with request_model: ${(log.request_model).toLowerCase()}, request: ${log.request}`);

                // Fetch request_code based on request_model
                if ((log.request_model).toLowerCase() === "requisition") {
                    const requisition = await RequisitionModel.findById(log.request).select("requisition_code");
                    if (requisition) requestCode = requisition.requisition_code;
                } else if ((log.request_model).toLowerCase() === "new_indent") {
                    const newIndent = await NewIndent.findById(log.request).select("newindent_code");
                    if (newIndent) requestCode = newIndent.newindent_code;
                } else if ((log.request_model).toLowerCase() === "order_request") {
                    const orderRequest = await OrderRequestModel.findById(log.request).select("orderRequest_code");
                    if (orderRequest) requestCode = orderRequest.orderRequest_code;
                }

                console.log("Fetched Request Code:", requestCode);
                log.request = requestCode;
            }
            return log;
        })
    );

    console.log("Final Logs:", logs);
    return logs;
}


static async ReturnEquipmentLogItemById(logId, returned_quantity, lost_or_damaged_quantity, date_returned) {
  if (!mongoose.Types.ObjectId.isValid(logId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
  }

  const logEntry = await EquipmentsLogModel.findById(logId).populate("item");
  if (!logEntry) {
    throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
  }

  const equipment = logEntry.item;

  // Check if the sum of returned and lost/damaged quantities equals the issued quantity
  const totalReturned = returned_quantity + lost_or_damaged_quantity;
  if (totalReturned !== logEntry.issued_quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, "The sum of returned and lost/damaged quantities must equal the issued quantity");
  }

  if(logEntry.issued_quantity<returned_quantity){
    throw new ApiError(httpStatus.BAD_REQUEST, "Returned quantity should be smaller than issued quantity");
  }
  equipment.current_quantity+=returned_quantity;

  // Track whether we need to send a stock recovery notification
  let stockRecoveryNotificationSent = false;

  // Trigger notifications based on updated stock levels
  if (equipment.current_quantity === 0) {
    equipment.status = "Out of Stock";
    await StockNotificationService.createNotification({
      itemId: equipment._id,
      title: `Out of Stock Alert: ${equipment.item_name}`,
      message: `The equipment ${equipment.item_name} is now out of stock.`,
      send_to: ["admin", "lab-assistant"],
      type: "out_of_stock",
    });


    // Delete "Stock Recovery" notifications since the stock is now low
    await StockNotificationService.deleteMany({
      itemId: equipment._id,
      type: "stock_recovered",
    });

  } else if (equipment.current_quantity <= equipment.min_stock_level) {
    equipment.status = "Low Stock";
    await StockNotificationService.createNotification({
      itemId: equipment._id,
      title: `Low Stock Alert: ${equipment.item_name}`,
      message: `The stock for ${equipment.item_name} is below the minimum level.`,
      send_to: ["admin", "lab-assistant"],
      type: "low_stock",
    });


    // Delete "Stock Recovery" notifications since the stock is now low
    await StockNotificationService.deleteMany({
      itemId: equipment._id,
      type: "stock_recovered",
    });

  } else {
    // If the stock has recovered to be "In Stock", create a new notification
    if (equipment.status === "Out of Stock" || equipment.status === "Low Stock") {
      equipment.status = "In Stock";
      stockRecoveryNotificationSent = true;
      await StockNotificationService.createNotification({
        itemId: equipment._id,
        title: `Stock Recovery: ${equipment.item_name}`,
        message: `The equipment ${equipment.item_name} is now back in stock and no longer out of stock or low stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "stock_recovered",
      });
    }
  }

  await equipment.save();

  // Proceed with the log entry update
  if (!date_returned|| isNaN(new Date(date_returned).getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date issued.");
  }

  logEntry.returned_quantity = returned_quantity;
  logEntry.lost_or_damaged_quantity = lost_or_damaged_quantity;
  logEntry.date_returned = new Date(date_returned);
  await logEntry.save();

  return { msg: "Equipment log returned successfully", stockRecoveryNotificationSent };
}
  
  static async UpdateEquipmentLogItemById(logId, newIssuedQuantity, user_email, date_issued) {
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
    }

    const logEntry = await EquipmentsLogModel.findById(logId).populate("item");
    if (!logEntry) {
      throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
    }

    const equipment = logEntry.item;
    const existingQuantity = logEntry.issued_quantity;

    if (typeof newIssuedQuantity !== "number" || newIssuedQuantity < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid issued quantity.");
    }

    const quantityDifference = newIssuedQuantity - existingQuantity;

    equipment.current_quantity -= quantityDifference;

    if (equipment.current_quantity < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Issued quantity exceeds current stock.");
    }

    // Track whether we need to send a stock recovery notification
    let stockRecoveryNotificationSent = false;

    // Trigger notifications based on updated stock levels
    if (equipment.current_quantity === 0) {
      equipment.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: equipment._id,
        title: `Out of Stock Alert: ${equipment.item_name}`,
        message: `The equipment ${equipment.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: equipment._id,
        type: "stock_recovered",
      });

    } else if (equipment.current_quantity <= equipment.min_stock_level) {
      equipment.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: equipment._id,
        title: `Low Stock Alert: ${equipment.item_name}`,
        message: `The stock for ${equipment.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: equipment._id,
        type: "stock_recovered",
      });

    } else {
      // If the stock has recovered to be "In Stock", create a new notification
      if (equipment.status === "Out of Stock" || equipment.status === "Low Stock") {
        equipment.status = "In Stock";
        stockRecoveryNotificationSent = true;
        await StockNotificationService.createNotification({
          itemId: equipment._id,
          title: `Stock Recovery: ${equipment.item_name}`,
          message: `The equipment ${equipment.item_name} is now back in stock and no longer out of stock or low stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "stock_recovered",
        });
      }
    }

    await equipment.save();

    // Proceed with the log entry update
    if (!date_issued || isNaN(new Date(date_issued).getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date issued.");
    }

    logEntry.issued_quantity = newIssuedQuantity;
    logEntry.user_email = user_email;
    logEntry.date_issued = new Date(date_issued);
    await logEntry.save();

    return { msg: "Equipment log updated successfully", stockRecoveryNotificationSent };
  }


  static async DeleteEquipmentsLogItem(logId) {
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
    }

    const logEntry = await EquipmentsLogModel.findById(logId).populate("item");
    if (!logEntry) {
      throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
    }

    const equipment = logEntry.item;

    // Revert the issued quantity back to stock
    equipment.current_quantity += logEntry.issued_quantity;

    let stockRecoveryNotificationSent = false;

    // Check the stock status after deletion and trigger necessary notifications
    if (equipment.current_quantity === 0) {
      equipment.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: equipment._id,
        title: `Out of Stock Alert: ${equipment.item_name}`,
        message: `The equipment ${equipment.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: equipment._id,
        type: "stock_recovered",
      });

    } else if (equipment.current_quantity <= equipment.min_stock_level) {
      equipment.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: equipment._id,
        title: `Low Stock Alert: ${equipment.item_name}`,
        message: `The stock for ${equipment.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: equipment._id,
        type: "stock_recovered",
      });

    } else {
      // If the stock has recovered to be "In Stock", create a new notification
      if (equipment.status === "Out of Stock" || equipment.status === "Low Stock") {
        equipment.status = "In Stock";
        stockRecoveryNotificationSent = true;
        await StockNotificationService.createNotification({
          itemId: equipment._id,
          title: `Stock Recovery: ${equipment.item_name}`,
          message: `The equipment ${equipment.item_name} is now back in stock and no longer out of stock or low stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "stock_recovered",
        });
      }
    }

    await equipment.save();

    // Delete the log entry
    await EquipmentsLogModel.findByIdAndDelete(logId);

    return { msg: "Log entry deleted successfully", stockRecoveryNotificationSent };
  }

   // Get all restocks
   static async GetAllRestocks(filters = {}) {
    const query = {};

    // Filter by equipment
    if (filters.equipment) {
      const matchingEquipments = await EquipmentsModel.find({
        $or: [
          { item_code: { $regex: filters.equipment, $options: "i" } },
          { item_name: { $regex: filters.equipment, $options: "i" } },
        ],
      }).select("_id");

      query.equipment = { $in: matchingEquipments.map((c) => c._id) };
    }

    if (filters.inward_code) {
      const inward = await InwardsModel.findOne({
        inward_code: { $regex: filters.inward_code, $options: "i" },
      }).select("_id"); // Fetch only `_id`

      if (inward) {
        query.inward = inward._id; // Use `_id` for querying
      } else {
        console.log(`Inward '${filters.inward_code}' not found.`);
        return []; // Return empty array if no match
      }
    }


    // Filter by location
    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }

    // Filter by expiration date (Exact match, before, or after)
    if (filters.expiration_date) {
      const date = new Date(filters.expiration_date);
      query.expiration_date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }


    // Fetch and populate restocks
    const restocks = await EquipmentsRestockModel.find(query)
      .populate("equipment", "item_code item_name") // Populate equipment details
      .populate("inward", "inward_code") // Populate inward_code correctly
      .sort({ createdAt: -1 });


    return restocks;
  }
  static async getItemCodesByClass(className) {
    if (className !== "Equipment") {
      return [];
    }

    const itemCodes = await EquipmentsModel.find({}, "item_code").lean();
    return itemCodes.map((item) => item.item_code);
  }

  static async DeleteEquipmentItem(user, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item ID format");
    }

    const equipment = await EquipmentsModel.findById(id);
    if (!equipment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Equipment item not found");
    }

    // Delete associated restock records
    await EquipmentsRestockModel.deleteMany({ equipment: id });

    // Delete associated logs
    await EquipmentsLogModel.deleteMany({ item: id });

    // Finally, delete the equipment item itself
    await EquipmentsModel.findByIdAndDelete(id);

    return { msg: "Item and associated restocks and logs deleted successfully" };
  }


 
  static async RestockEquipment(user, body) {
    const {
      inward, // Sent from frontend
      item_code,
      item_name,
      quantity_purchased,
      expiration_date,
      location,
      maintenance_date,
      maintenance_details
    } = body;

    // Validate inward ID format
    if (!mongoose.Types.ObjectId.isValid(inward)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid inward ID format");
    }

    // Fetch inward record
    const inwardRecord = await InwardsModel.findById(inward);
    if (!inwardRecord) {
      throw new ApiError(httpStatus.NOT_FOUND, "Inward record not found");
    }

    let existingEquipment;

    if (body.equipment) {
      if (!mongoose.Types.ObjectId.isValid(body.equipment)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid equipment ID");
      }
      existingEquipment = await EquipmentsModel.findById(body.equipment);
    } else if (item_code) {
      existingEquipment = await EquipmentsModel.findOne({ item_code });
    } else if (item_name) {
      existingEquipment = await EquipmentsModel.findOne({ item_name });
    }

    if (!existingEquipment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Equipment not found");
    }

    // Log the purchase in Restock Model
    const restockRecord = await EquipmentsRestockModel.create({
      equipment: existingEquipment._id,
      inward: inwardRecord._id,
      quantity_purchased,
      expiration_date,
      location,
      maintenance_date,
      maintenance_details
    });

    // Update the equipment stock
    existingEquipment.total_quantity += quantity_purchased;
    existingEquipment.current_quantity += quantity_purchased;
    existingEquipment.status =
      existingEquipment.current_quantity <= existingEquipment.min_stock_level
        ? "Low Stock"
        : "In Stock";

    await existingEquipment.save();

    return { msg: "Equipment restocked successfully", restockRecord };
  }

  static async UpdateEquipmentsItemById(user, body, id) {
    const {
      item_name,
      model_number,
      serial_number,
      manual,
      company,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
      expiration_date,
    } = body;

    const existingItem = await EquipmentsModel.findById(id);
    if (!existingItem) {
      throw new ApiError(httpStatus.NOT_FOUND, "Equipments item not found");
    }

    const updatedData = {
      item_name,
      serial_number,
      model_number,
      manual,
      company,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
    };

    if (expiration_date) {
      updatedData.expiration_date = expiration_date;
    }

    await EquipmentsModel.findByIdAndUpdate(id, updatedData, { new: true });

    return { msg: "Equipments item updated successfully" };
  }

  // Get Equipments items for search
  static async GetEquipmentsItemForSearch() {
    const data = await EquipmentsModel.find({}).select(
      "item_code casNo item_name company"
    );

    return {
      items: data,
    };
  }


  // Update restock record by ID
  static async UpdateRestockRecordById(restockId, body) {
    const { quantity_purchased, expiration_date, location, maintenance_date, maintenance_details, inward_code } = body;

    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await EquipmentsRestockModel.findById(restockId);
    if (!restockRecord) {
      throw new ApiError(httpStatus.NOT_FOUND, "Restock record not found");
    }

    const originalQuantity = restockRecord.quantity_purchased;

    if (inward_code) {
      const inwardRecord = await InwardsModel.findOne({ inward_code });
      if (!inwardRecord) {
        throw new ApiError(httpStatus.NOT_FOUND, "Inward record not found");
      }
      restockRecord.inward = inwardRecord._id;
    }

    restockRecord.quantity_purchased = quantity_purchased || restockRecord.quantity_purchased;
    restockRecord.expiration_date = expiration_date || restockRecord.expiration_date;
    restockRecord.location = location || restockRecord.location;
    restockRecord.maintenance_date = maintenance_date || restockRecord.maintenance_date;
    restockRecord.maintenance_details = maintenance_details || restockRecord.maintenance_details;

    await restockRecord.save();

    const equipmentRecord = await EquipmentsModel.findById(restockRecord.equipment);
    if (equipmentRecord) {
      const quantityDifference = (quantity_purchased || originalQuantity) - originalQuantity;
      equipmentRecord.current_quantity += quantityDifference;
      equipmentRecord.total_quantity += quantityDifference;
      equipmentRecord.status =
        equipmentRecord.current_quantity <= equipmentRecord.min_stock_level
          ? "Low Stock"
          : "In Stock";
      await equipmentRecord.save();
    }

    return { msg: "Restock record updated successfully", restockRecord };
  }


  static async DeleteRestockRecordById(restockId) {
    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await EquipmentsRestockModel.findById(restockId);
    if (!restockRecord) {
      throw new ApiError(httpStatus.NOT_FOUND, "Restock record not found");
    }

    await EquipmentsRestockModel.findByIdAndDelete(restockId);
    return { msg: "Restock record deleted successfully" };
  }


  static async LogIssuedQuantity(item_id, request_model, request, issued_quantity, date_issued, user_email) {


    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Item ID must be a valid MongoDB ObjectId"
      );
    }

    // Validate request if provided
    if (request && !mongoose.Types.ObjectId.isValid(request)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Request ID must be a valid MongoDB ObjectId");
    }

    const equipment = await EquipmentsModel.findById(item_id);
    if (!equipment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Equipment item not found");
    }

    if (equipment.current_quantity < issued_quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Issued quantity exceeds current stock."
      );
    }

    // Log the issued quantity
    const logEntry = new EquipmentsLogModel({
      item: item_id,
      request_model: request_model,
      request: request,
      issued_quantity,
      date_issued,
      user_email,
    });

    await logEntry.save();

    // Update the stock quantity
    equipment.current_quantity -= issued_quantity;

    // Handle stock notifications
    if (equipment.current_quantity === 0) {
      equipment.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: equipment._id,
        title: `Out of Stock Alert: ${equipment.item_name}`,
        message: `The equipment ${equipment.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });

      await StockNotificationService.deleteMany({
        itemId: equipment._id,
        type: "stock_recovered",
      });

    } else if (equipment.current_quantity <= equipment.min_stock_level) {
      equipment.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: equipment._id,
        title: `Low Stock Alert: ${equipment.item_name}`,
        message: `The stock for ${equipment.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });

      await StockNotificationService.deleteMany({
        itemId: equipment._id,
        type: "stock_recovered",
      });

    } else {
      equipment.status = "In Stock";
    }

    await equipment.save();


    return logEntry;
  }


}
module.exports = EquipmentsService;




