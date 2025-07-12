const httpStatus = require("http-status");
const {
  ConsumablesModel,
  ConsumablesLogModel,
  ConsumablesRestockModel,
  InwardsModel,
  OrderRequestModel,
  NewIndent,
  RequisitionModel,
} = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const StockNotificationService = require("../services/stockNotification.service");


class ConsumablesService {
  static async RegisterConsumablesItem(user, body) {
    const {
      item_name,
      casNo,
      msds,
      company,
      total_quantity,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
    } = body;

     // Extract the first 3 letters of the item_name in uppercase
             const itemCodePrefix = item_name.slice(0, 3).toUpperCase();
           
             // Find the last item with the same prefix
             const lastItem = await ConsumablesModel.findOne({
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
    const current_quantity = total_quantity;

    const consumable = await ConsumablesModel.create({
      item_code,
      item_name,
      casNo,
      msds,
      company,
      purpose,
      total_quantity,
      current_quantity,
      min_stock_level,
      unit_of_measure,
      description,
      status: current_quantity > min_stock_level ? "In Stock" : "Out of Stock",
      user,
    });

    return { msg: "Consumables item added successfully!", consumable };
  }


  static async getItemCodesByClass(className) {
    if (className !== "Consumable") {
      return [];
    }

    const itemCodes = await ConsumablesModel.find({}, "item_code").lean();
    return itemCodes.map((item) => item.item_code);
  }
  
  static async RestockConsumable(user, body) {
    const {
      inward, // Sent from frontend
      item_code,
      item_name,
      quantity_purchased,
      expiration_date,
      location,
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

let existingConsumable;

if (body.consumable) {
  if (!mongoose.Types.ObjectId.isValid(body.consumable)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid consumable ID");
  }
  existingConsumable = await ConsumablesModel.findById(body.consumable);
} else if (item_code) {
  existingConsumable = await ConsumablesModel.findOne({ item_code });
} else if (item_name) {
  existingConsumable = await ConsumablesModel.findOne({ item_name });
}

if (!existingConsumable) {
  throw new ApiError(httpStatus.NOT_FOUND, "Consumable not found");
}

    // Log the purchase in Restock Model
    const restockRecord = await ConsumablesRestockModel.create({
      consumable: existingConsumable._id,
      inward: inwardRecord._id,
      quantity_purchased,
      expiration_date,
      location,
    });

    // Update the consumable stock
    existingConsumable.total_quantity += quantity_purchased;
    existingConsumable.current_quantity += quantity_purchased;
    existingConsumable.status =
      existingConsumable.current_quantity <= existingConsumable.min_stock_level
        ? "Low Stock"
        : "In Stock";

    await existingConsumable.save();

    return { msg: "Consumable restocked successfully", restockRecord };
  }

  // Update restock record by ID
  static async UpdateRestockRecordById(restockId, body) {
    const { quantity_purchased, expiration_date, location, inward_code } = body;

    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await ConsumablesRestockModel.findById(restockId);
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

    await restockRecord.save();

    const consumableRecord = await ConsumablesModel.findById(restockRecord.consumable);
    if (consumableRecord) {
      const quantityDifference = (quantity_purchased || originalQuantity) - originalQuantity;
      consumableRecord.current_quantity += quantityDifference;
      consumableRecord.total_quantity += quantityDifference;
      consumableRecord.status =
        consumableRecord.current_quantity <= consumableRecord.min_stock_level
          ? "Low Stock"
          : "In Stock";
      await consumableRecord.save();
    }

    return { msg: "Restock record updated successfully", restockRecord };
  }

  // Delete restock record by ID
  static async DeleteRestockRecordById(restockId) {
    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await ConsumablesRestockModel.findById(restockId);
    if (!restockRecord) {
      throw new ApiError(httpStatus.NOT_FOUND, "Restock record not found");
    }

    const originalQuantity = restockRecord.quantity_purchased;
    await ConsumablesRestockModel.findByIdAndDelete(restockId);

    const consumableRecord = await ConsumablesModel.findById(restockRecord.consumable);
    if (consumableRecord) {
      consumableRecord.current_quantity -= originalQuantity;
      consumableRecord.total_quantity -= originalQuantity;
      consumableRecord.status =
        consumableRecord.current_quantity <= consumableRecord.min_stock_level
          ? "Low Stock"
          : "In Stock";
      await consumableRecord.save();
    }

    return { msg: "Restock record deleted successfully" };
  }

  // Get all restocks
  static async GetAllRestocks(filters = {}) {
    const query = {};
  
    // Filter by consumable
    if (filters.consumable) {
      const matchingConsumables = await ConsumablesModel.find({
        $or: [
          { item_code: { $regex: filters.consumable, $options: "i" } },
          { item_name: { $regex: filters.consumable, $options: "i" } },
        ],
      }).select("_id");
  
      query.consumable = { $in: matchingConsumables.map((c) => c._id) };
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
    const restocks = await ConsumablesRestockModel.find(query)
      .populate("consumable", "item_code item_name") // Populate consumable details
      .populate("inward", "inward_code") // Populate inward_code correctly
      .sort({ createdAt: -1 });
  
    
    return restocks;
  }
  
  // Delete a Consumables item and its associated restocks and logs
  static async DeleteConsumablesItem(user, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item ID format");
    }

    const consumable = await ConsumablesModel.findById(id);
    if (!consumable) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Consumables item not found in the record"
      );
    }

    // Delete associated restock records
    await ConsumablesRestockModel.deleteMany({ consumable: id });

    // Delete associated logs
    await ConsumablesLogModel.deleteMany({ item: id });

    // Finally, delete the consumable item itself
    await ConsumablesModel.findByIdAndDelete(id);

    return {
      msg: "Item and associated restocks and logs deleted successfully",
    };
  }

  // Get a Consumables item by its ID
  static async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item ID format");
    }

    const item = await ConsumablesModel.findById(id);
    if (!item) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Consumables item not found in the record"
      );
    }

    return { item };
  }



  static async GetAllItems(filters = {}) {
    const query = {}; // Initialize an empty query object
  
    // Add individual fields to the query object if they are present in the filters
    if (filters.item_code) query.item_code = { $regex: filters.item_code, $options: "i" };
    if (filters.item_name) query.item_name = { $regex: filters.item_name, $options: "i" };
    if (filters.casNo) query.casNo = { $regex: filters.casNo, $options: "i" };
    if (filters.company) query.company = { $regex: filters.company, $options: "i" };
    if (filters.status) query.status = { $regex: filters.status, $options: "i" };
    if (filters.purpose) query.purpose = { $regex: filters.purpose, $options: "i" };
    if (filters.unit_of_measure) query.unit_of_measure = { $regex: filters.unit_of_measure, $options: "i" };
    if (filters.description) query.description = { $regex: filters.description, $options: "i" };
  
    const data = await ConsumablesModel.find(query).select(
      "item_code item_name casNo msds company createdAt purpose total_quantity current_quantity min_stock_level unit_of_measure updatedAt status description"
    );
  
    const totalConsumables = data.length;
  
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
      total: totalConsumables,
    };
  }
  


  static async UpdateConsumablesItemById(user, body, id) {
    const {
      item_name,
      casNo,
      msds,
      company,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
      expiration_date,
    } = body;

    const existingItem = await ConsumablesModel.findById(id);
    if (!existingItem) {
      throw new ApiError(httpStatus.NOT_FOUND, "Consumables item not found");
    }

    const updatedData = {
      item_name,
      casNo,
      msds,
      company,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
    };

    if (expiration_date) {
      updatedData.expiration_date = expiration_date;
    }

    await ConsumablesModel.findByIdAndUpdate(id, updatedData, { new: true });

    return { msg: "Consumables item updated successfully" };
  }

  // Get Consumables items for search
  static async GetConsumablesItemForSearch() {
    const data = await ConsumablesModel.find({}).select(
      "item_code casNo item_name company"
    );

    return {
      items: data,
    };
  }
  static async GetLogs(filters) {
    console.log("filters: ", filters);
    const query = {};

    // Construct OR query for item_code and item_name
    let consumableQuery = [];

    if (filters.item_code) {
        consumableQuery.push({ item_code: { $regex: filters.item_code, $options: "i" } });
    }
    if (filters.item_name) {
        consumableQuery.push({ item_name: { $regex: filters.item_name, $options: "i" } });
    }

    if (consumableQuery.length > 0) {
        const consumable = await ConsumablesModel.findOne({ $or: consumableQuery }).select("_id");

        if (!consumable) {
            console.log("No matching consumable found for given item_code or item_name");
            return []; // Exit early to prevent incorrect logs from being returned
        }
        
        query.item = consumable._id;
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
    let logs = await ConsumablesLogModel.find(query)
        .populate("item", "item_code item_name")
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

  
    // Log issued quantity
   // Log issued quantity

   
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
   
     const consumable = await ConsumablesModel.findById(item_id);
     if (!consumable) {
       throw new ApiError(httpStatus.NOT_FOUND, "Consumable item not found");
     }
   
     if (consumable.current_quantity < issued_quantity) {
       throw new ApiError(
         httpStatus.BAD_REQUEST,
         "Issued quantity exceeds current stock."
       );
     }
   
     // Log the issued quantity
     const logEntry = new ConsumablesLogModel({
       item: item_id,
       request_model: request_model,
       request: request,
       issued_quantity,
       date_issued,
       user_email,
     });
   
     await logEntry.save();
   
     // Update the stock quantity
     consumable.current_quantity -= issued_quantity;
   
     // Handle stock notifications
     if (consumable.current_quantity === 0) {
       consumable.status = "Out of Stock";
       await StockNotificationService.createNotification({
         itemId: consumable._id,
         title: `Out of Stock Alert: ${consumable.item_name}`,
         message: `The consumable ${consumable.item_name} is now out of stock.`,
         send_to: ["admin", "lab-assistant"],
         type: "out_of_stock",
       });
   
       await StockNotificationService.deleteMany({
         itemId: consumable._id,
         type: "stock_recovered",
       });
   
     } else if (consumable.current_quantity <= consumable.min_stock_level) {
       consumable.status = "Low Stock";
       await StockNotificationService.createNotification({
         itemId: consumable._id,
         title: `Low Stock Alert: ${consumable.item_name}`,
         message: `The stock for ${consumable.item_name} is below the minimum level.`,
         send_to: ["admin", "lab-assistant"],
         type: "low_stock",
       });
   
       await StockNotificationService.deleteMany({
         itemId: consumable._id,
         type: "stock_recovered",
       });
   
     } else {
       consumable.status = "In Stock";
     }
   
     await consumable.save();
 
   
     return logEntry;
   }
   

    static async UpdateConsumableLogItemById(logId, newIssuedQuantity, user_email, date_issued) {
      if (!mongoose.Types.ObjectId.isValid(logId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
      }
    
      const logEntry = await ConsumablesLogModel.findById(logId).populate("item");
      if (!logEntry) {
        throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
      }
    
      const consumable = logEntry.item;
      const existingQuantity = logEntry.issued_quantity;
    
      if (typeof newIssuedQuantity !== "number" || newIssuedQuantity < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid issued quantity.");
      }
    
      const quantityDifference = newIssuedQuantity - existingQuantity;
    
      consumable.current_quantity -= quantityDifference;
    
      if (consumable.current_quantity < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Issued quantity exceeds current stock.");
      }
    
      // Track whether we need to send a stock recovery notification
      let stockRecoveryNotificationSent = false;
    
      // Trigger notifications based on updated stock levels
      if (consumable.current_quantity === 0) {
        consumable.status = "Out of Stock";
        await StockNotificationService.createNotification({
          itemId: consumable._id,
          title: `Out of Stock Alert: ${consumable.item_name}`,
          message: `The consumable ${consumable.item_name} is now out of stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "out_of_stock",
        });


    // Delete "Stock Recovery" notifications since the stock is now low
    await StockNotificationService.deleteMany({
      itemId: consumable._id,
      type: "stock_recovered",
    });

      } else if (consumable.current_quantity <= consumable.min_stock_level) {
        consumable.status = "Low Stock";
        await StockNotificationService.createNotification({
          itemId: consumable._id,
          title: `Low Stock Alert: ${consumable.item_name}`,
          message: `The stock for ${consumable.item_name} is below the minimum level.`,
          send_to: ["admin", "lab-assistant"],
          type: "low_stock",
        });


    // Delete "Stock Recovery" notifications since the stock is now low
    await StockNotificationService.deleteMany({
      itemId: consumable._id,
      type: "stock_recovered",
    });

      } else {
        // If the stock has recovered to be "In Stock", create a new notification
        if (consumable.status === "Out of Stock" || consumable.status === "Low Stock") {
          consumable.status = "In Stock";
          stockRecoveryNotificationSent = true;
          await StockNotificationService.createNotification({
            itemId: consumable._id,
            title: `Stock Recovery: ${consumable.item_name}`,
            message: `The consumable ${consumable.item_name} is now back in stock and no longer out of stock or low stock.`,
            send_to: ["admin", "lab-assistant"],
            type: "stock_recovered",
          });
        }
      }
    
      await consumable.save();
    
      // Proceed with the log entry update
      if (!date_issued || isNaN(new Date(date_issued).getTime())) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date issued.");
      }
    
      logEntry.issued_quantity = newIssuedQuantity;
      logEntry.user_email = user_email;
      logEntry.date_issued = new Date(date_issued);
      await logEntry.save();
    
      return { msg: "Consumable log updated successfully", stockRecoveryNotificationSent };
    }
    

    static async DeleteConsumablesLogItem(logId) {
      if (!mongoose.Types.ObjectId.isValid(logId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
      }
    
      const logEntry = await ConsumablesLogModel.findById(logId).populate("item");
      if (!logEntry) {
        throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
      }
    
      const consumable = logEntry.item;
    
      // Revert the issued quantity back to stock
      consumable.current_quantity += logEntry.issued_quantity;
    
      let stockRecoveryNotificationSent = false;
    
      // Check the stock status after deletion and trigger necessary notifications
      if (consumable.current_quantity === 0) {
        consumable.status = "Out of Stock";
        await StockNotificationService.createNotification({
          itemId: consumable._id,
          title: `Out of Stock Alert: ${consumable.item_name}`,
          message: `The consumable ${consumable.item_name} is now out of stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "out_of_stock",
        });


    // Delete "Stock Recovery" notifications since the stock is now low
    await StockNotificationService.deleteMany({
      itemId: consumable._id,
      type: "stock_recovered",
    });

      } else if (consumable.current_quantity <= consumable.min_stock_level) {
        consumable.status = "Low Stock";
        await StockNotificationService.createNotification({
          itemId: consumable._id,
          title: `Low Stock Alert: ${consumable.item_name}`,
          message: `The stock for ${consumable.item_name} is below the minimum level.`,
          send_to: ["admin", "lab-assistant"],
          type: "low_stock",
        });


    // Delete "Stock Recovery" notifications since the stock is now low
    await StockNotificationService.deleteMany({
      itemId: consumable._id,
      type: "stock_recovered",
    });
    
      } else {
        // If the stock has recovered to be "In Stock", create a new notification
        if (consumable.status === "Out of Stock" || consumable.status === "Low Stock") {
          consumable.status = "In Stock";
          stockRecoveryNotificationSent = true;
          await StockNotificationService.createNotification({
            itemId: consumable._id,
            title: `Stock Recovery: ${consumable.item_name}`,
            message: `The consumable ${consumable.item_name} is now back in stock and no longer out of stock or low stock.`,
            send_to: ["admin", "lab-assistant"],
            type: "stock_recovered",
          });
        }
      }
    
      await consumable.save();
    
      // Delete the log entry
      await ConsumablesLogModel.findByIdAndDelete(logId);
    
      return { msg: "Log entry deleted successfully", stockRecoveryNotificationSent };
    }
    
  }
  
  module.exports = ConsumablesService;
  

module.exports = ConsumablesService;
