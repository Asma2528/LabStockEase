const httpStatus = require("http-status");
const {
  OthersModel,
  OthersLogModel,
  OthersRestockModel,
  InwardsModel,
  OrderRequestModel,
  NewIndent,
  RequisitionModel,
} = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const StockNotificationService = require("../services/stockNotification.service");


class OthersService {
  static async RegisterOthersItem(user, body) {
    const {
      item_name,
      category,
      company,
      purpose,
      total_quantity,
      min_stock_level,
      unit_of_measure,
      description,
    } = body;

    // Extract the first 3 letters of the item_name in uppercase
            const itemCodePrefix = item_name.slice(0, 3).toUpperCase();
          
            // Find the last item with the same prefix
            const lastItem = await OthersModel.findOne({
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

    const other = await OthersModel.create({
      item_code,
      item_name,
      category,
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

    return { msg: "Others item added successfully!", other };
  }


  static async getItemCodesByClass(className) {
    if (className !== "Other") {
      return [];
    }

    const itemCodes = await OthersModel.find({}, "item_code").lean();
    return itemCodes.map((item) => item.item_code);
  }

  static async RestockOther(user, body) {
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

    let existingOther;

    if (body.other) {
      if (!mongoose.Types.ObjectId.isValid(body.other)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid other ID");
      }
      existingOther = await OthersModel.findById(body.other);
    } else if (item_code) {
      existingOther = await OthersModel.findOne({ item_code });
    } else if (item_name) {
      existingOther = await OthersModel.findOne({ item_name });
    }

    if (!existingOther) {
      throw new ApiError(httpStatus.NOT_FOUND, "Other not found");
    }

    // Log the purchase in Restock Model
    const restockRecord = await OthersRestockModel.create({
      other: existingOther._id,
      inward: inwardRecord._id,
      quantity_purchased,
      expiration_date,
      location,
    });

    // Update the other stock
    existingOther.total_quantity += quantity_purchased;
    existingOther.current_quantity += quantity_purchased;
    existingOther.status =
      existingOther.current_quantity <= existingOther.min_stock_level
        ? "Low Stock"
        : "In Stock";

    await existingOther.save();

    return { msg: "Other restocked successfully", restockRecord };
  }

  // Update restock record by ID
  static async UpdateRestockRecordById(restockId, body) {
    const { quantity_purchased, expiration_date, location, inward_code } = body;

    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await OthersRestockModel.findById(restockId);
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

    const otherRecord = await OthersModel.findById(restockRecord.other);
    if (otherRecord) {
      const quantityDifference = (quantity_purchased || originalQuantity) - originalQuantity;
      otherRecord.current_quantity += quantityDifference;
      otherRecord.total_quantity += quantityDifference;
      otherRecord.status =
        otherRecord.current_quantity <= otherRecord.min_stock_level
          ? "Low Stock"
          : "In Stock";
      await otherRecord.save();
    }

    return { msg: "Restock record updated successfully", restockRecord };
  }

  // Delete restock record by ID
  static async DeleteRestockRecordById(restockId) {
    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await OthersRestockModel.findById(restockId);
    if (!restockRecord) {
      throw new ApiError(httpStatus.NOT_FOUND, "Restock record not found");
    }

    const originalQuantity = restockRecord.quantity_purchased;
    await OthersRestockModel.findByIdAndDelete(restockId);

    const otherRecord = await OthersModel.findById(restockRecord.other);
    if (otherRecord) {
      otherRecord.current_quantity -= originalQuantity;
      otherRecord.total_quantity -= originalQuantity;
      otherRecord.status =
        otherRecord.current_quantity <= otherRecord.min_stock_level
          ? "Low Stock"
          : "In Stock";
      await otherRecord.save();
    }

    return { msg: "Restock record deleted successfully" };
  }

  // Get all restocks
  static async GetAllRestocks(filters = {}) {
    const query = {};

    // Filter by other
    if (filters.other) {
      const matchingOthers = await OthersModel.find({
        $or: [
          { item_code: { $regex: filters.other, $options: "i" } },
          { item_name: { $regex: filters.other, $options: "i" } },
        ],
      }).select("_id");

      query.other = { $in: matchingOthers.map((c) => c._id) };
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
    const restocks = await OthersRestockModel.find(query)
      .populate("other", "item_code item_name") // Populate other details
      .populate("inward", "inward_code") // Populate inward_code correctly
      .sort({ createdAt: -1 });


    return restocks;
  }

  // Delete a Others item and its associated restocks and logs
  static async DeleteOthersItem(user, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item ID format");
    }

    const other = await OthersModel.findById(id);
    if (!other) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Others item not found in the record"
      );
    }

    // Delete associated restock records
    await OthersRestockModel.deleteMany({ other: id });

    // Delete associated logs
    await OthersLogModel.deleteMany({ item: id });

    // Finally, delete the other item itself
    await OthersModel.findByIdAndDelete(id);

    return {
      msg: "Item and associated restocks and logs deleted successfully",
    };
  }

  // Get a Others item by its ID
  static async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item ID format");
    }

    const item = await OthersModel.findById(id);
    if (!item) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Others item not found in the record"
      );
    }

    return { item };
  }



  static async GetAllItems(filters = {}) {
    const query = {}; // Initialize an empty query object

    // Add individual fields to the query object if they are present in the filters
    if (filters.item_code) query.item_code = { $regex: filters.item_code, $options: "i" };
    if (filters.item_name) query.item_name = { $regex: filters.item_name, $options: "i" };
    if (filters.category) query.category = { $regex: filters.category, $options: "i" };
    if (filters.company) query.company = { $regex: filters.company, $options: "i" };
    if (filters.status) query.status = { $regex: filters.status, $options: "i" };
    if (filters.purpose) query.purpose = { $regex: filters.purpose, $options: "i" };
    if (filters.unit_of_measure) query.unit_of_measure = { $regex: filters.unit_of_measure, $options: "i" };
    if (filters.description) query.description = { $regex: filters.description, $options: "i" };

    const data = await OthersModel.find(query).select(
      "item_code item_name category company createdAt purpose total_quantity current_quantity min_stock_level unit_of_measure updatedAt status description"
    );

    const totalOthers = data.length;

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
      total: totalOthers,
    };
  }



  static async UpdateOthersItemById(user, body, id) {
    const {
      item_name,
      category,
      company,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
      expiration_date,
    } = body;

    const existingItem = await OthersModel.findById(id);
    if (!existingItem) {
      throw new ApiError(httpStatus.NOT_FOUND, "Others item not found");
    }

    const updatedData = {
      item_name,
      category,
      company,
      purpose,
      min_stock_level,
      unit_of_measure,
      description,
    };

    if (expiration_date) {
      updatedData.expiration_date = expiration_date;
    }

    await OthersModel.findByIdAndUpdate(id, updatedData, { new: true });

    return { msg: "Others item updated successfully" };
  }

  // Get Others items for search
  static async GetOthersItemForSearch() {
    const data = await OthersModel.find({}).select(
      "item_code category item_name company"
    );

    return {
      items: data,
    };
  }

  static async GetLogs(filters) {

    const query = {};

    // Construct OR query for item_code and item_name
    let otherQuery = [];

    if (filters.item_code) {
      otherQuery.push({ item_code: { $regex: filters.item_code, $options: "i" } });
    }
    if (filters.item_name) {
      otherQuery.push({ item_name: { $regex: filters.item_name, $options: "i" } });
    }

    if (otherQuery.length > 0) {
      const other = await OthersModel.findOne({ $or: otherQuery }).select("_id");

      if (!other) {
        console.log("No matching other found for given item_code or item_name");
        return []; // Exit early to prevent incorrect logs from being returned
      }

      query.item = other._id;
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
    let logs = await OthersLogModel.find(query)
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

    const other = await OthersModel.findById(item_id);
    if (!other) {
      throw new ApiError(httpStatus.NOT_FOUND, "Other item not found");
    }

    if (other.current_quantity < issued_quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Issued quantity exceeds current stock."
      );
    }

    // Log the issued quantity
    const logEntry = new OthersLogModel({
      item: item_id,
      request_model: request_model,
      request: request,
      issued_quantity,
      date_issued,
      user_email,
    });

    await logEntry.save();

    // Update the stock quantity
    other.current_quantity -= issued_quantity;

    // Handle stock notifications
    if (other.current_quantity === 0) {
      other.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: other._id,
        title: `Out of Stock Alert: ${other.item_name}`,
        message: `The other ${other.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });

      await StockNotificationService.deleteMany({
        itemId: other._id,
        type: "stock_recovered",
      });

    } else if (other.current_quantity <= other.min_stock_level) {
      other.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: other._id,
        title: `Low Stock Alert: ${other.item_name}`,
        message: `The stock for ${other.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });

      await StockNotificationService.deleteMany({
        itemId: other._id,
        type: "stock_recovered",
      });

    } else {
      other.status = "In Stock";
    }

    await other.save();


    return logEntry;
  }


  static async UpdateOtherLogItemById(logId, newIssuedQuantity, user_email, date_issued) {
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
    }

    const logEntry = await OthersLogModel.findById(logId).populate("item");
    if (!logEntry) {
      throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
    }

    const other = logEntry.item;
    const existingQuantity = logEntry.issued_quantity;

    if (typeof newIssuedQuantity !== "number" || newIssuedQuantity < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid issued quantity.");
    }

    const quantityDifference = newIssuedQuantity - existingQuantity;

    other.current_quantity -= quantityDifference;

    if (other.current_quantity < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Issued quantity exceeds current stock.");
    }

    // Track whether we need to send a stock recovery notification
    let stockRecoveryNotificationSent = false;

    // Trigger notifications based on updated stock levels
    if (other.current_quantity === 0) {
      other.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: other._id,
        title: `Out of Stock Alert: ${other.item_name}`,
        message: `The other ${other.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: other._id,
        type: "stock_recovered",
      });

    } else if (other.current_quantity <= other.min_stock_level) {
      other.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: other._id,
        title: `Low Stock Alert: ${other.item_name}`,
        message: `The stock for ${other.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: other._id,
        type: "stock_recovered",
      });

    } else {
      // If the stock has recovered to be "In Stock", create a new notification
      if (other.status === "Out of Stock" || other.status === "Low Stock") {
        other.status = "In Stock";
        stockRecoveryNotificationSent = true;
        await StockNotificationService.createNotification({
          itemId: other._id,
          title: `Stock Recovery: ${other.item_name}`,
          message: `The other ${other.item_name} is now back in stock and no longer out of stock or low stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "stock_recovered",
        });
      }
    }

    await other.save();

    // Proceed with the log entry update
    if (!date_issued || isNaN(new Date(date_issued).getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date issued.");
    }

    logEntry.issued_quantity = newIssuedQuantity;
    logEntry.user_email = user_email;
    logEntry.date_issued = new Date(date_issued);
    await logEntry.save();

    return { msg: "Other log updated successfully", stockRecoveryNotificationSent };
  }


  static async DeleteOthersLogItem(logId) {
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
    }

    const logEntry = await OthersLogModel.findById(logId).populate("item");
    if (!logEntry) {
      throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
    }

    const other = logEntry.item;

    // Revert the issued quantity back to stock
    other.current_quantity += logEntry.issued_quantity;

    let stockRecoveryNotificationSent = false;

    // Check the stock status after deletion and trigger necessary notifications
    if (other.current_quantity === 0) {
      other.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: other._id,
        title: `Out of Stock Alert: ${other.item_name}`,
        message: `The other ${other.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: other._id,
        type: "stock_recovered",
      });

    } else if (other.current_quantity <= other.min_stock_level) {
      other.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: other._id,
        title: `Low Stock Alert: ${other.item_name}`,
        message: `The stock for ${other.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: other._id,
        type: "stock_recovered",
      });

    } else {
      // If the stock has recovered to be "In Stock", create a new notification
      if (other.status === "Out of Stock" || other.status === "Low Stock") {
        other.status = "In Stock";
        stockRecoveryNotificationSent = true;
        await StockNotificationService.createNotification({
          itemId: other._id,
          title: `Stock Recovery: ${other.item_name}`,
          message: `The other ${other.item_name} is now back in stock and no longer out of stock or low stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "stock_recovered",
        });
      }
    }

    await other.save();

    // Delete the log entry
    await OthersLogModel.findByIdAndDelete(logId);

    return { msg: "Log entry deleted successfully", stockRecoveryNotificationSent };
  }

}

module.exports = OthersService;

