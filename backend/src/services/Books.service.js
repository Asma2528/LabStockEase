const httpStatus = require("http-status");
const {
  BooksModel,
  BooksLogModel,
  BooksRestockModel,
  InwardsModel,
  OrderRequestModel,
  NewIndent,
  RequisitionModel,
} = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const StockNotificationService = require("../services/stockNotification.service");


class BooksService {
  static async RegisterBooksItem(user, body) {
    const {
      item_name,
      author,
      location,
      publisher,
      edition,
      total_quantity,
      min_stock_level,
      description,
    } = body;

   // Extract the first 3 letters of the item_name in uppercase
           const itemCodePrefix = item_name.slice(0, 3).toUpperCase();
         
           // Find the last item with the same prefix
           const lastItem = await BooksModel.findOne({
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

    const book = await BooksModel.create({
      item_code,
      item_name,
      author,
      location,
      publisher,
      edition,
      min_stock_level,
      description,
      total_quantity,
      current_quantity,
      status: current_quantity > min_stock_level ? "In Stock" : "Out of Stock",
      user,
    });

    return { msg: "Books item added successfully!", book };
  }


  static async getItemCodesByClass(className) {
    if (className !== "Book") {
      return [];
    }

    const itemCodes = await BooksModel.find({}, "item_code").lean();
    return itemCodes.map((item) => item.item_code);
  }

  static async RestockBook(user, body) {
    const {
      inward, // Sent from frontend
      item_code,
      item_name,
      quantity_purchased,
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

    let existingBook;

    if (body.book) {
      if (!mongoose.Types.ObjectId.isValid(body.book)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid book ID");
      }
      existingBook = await BooksModel.findById(body.book);
    } else if (item_code) {
      existingBook = await BooksModel.findOne({ item_code });
    } else if (item_name) {
      existingBook = await BooksModel.findOne({ item_name });
    }

    if (!existingBook) {
      throw new ApiError(httpStatus.NOT_FOUND, "Book not found");
    }

    // Log the purchase in Restock Model
    const restockRecord = await BooksRestockModel.create({
      book: existingBook._id,
      inward: inwardRecord._id,
      quantity_purchased,
    });

    // Update the book stock
    existingBook.total_quantity += quantity_purchased;
    existingBook.current_quantity += quantity_purchased;
    existingBook.status =
      existingBook.current_quantity <= existingBook.min_stock_level
        ? "Low Stock"
        : "In Stock";

    await existingBook.save();

    return { msg: "Book restocked successfully", restockRecord };
  }

  // Update restock record by ID
  static async UpdateRestockRecordById(restockId, body) {
    const { quantity_purchased, inward_code } = body;

    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await BooksRestockModel.findById(restockId);
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

    await restockRecord.save();

    const bookRecord = await BooksModel.findById(restockRecord.book);
    if (bookRecord) {
      const quantityDifference = (quantity_purchased || originalQuantity) - originalQuantity;
      bookRecord.current_quantity += quantityDifference;
      bookRecord.total_quantity += quantityDifference;
      bookRecord.status =
        bookRecord.current_quantity <= bookRecord.min_stock_level
          ? "Low Stock"
          : "In Stock";
      await bookRecord.save();
    }

    return { msg: "Restock record updated successfully", restockRecord };
  }

  // Delete restock record by ID
  static async DeleteRestockRecordById(restockId) {
    if (!mongoose.Types.ObjectId.isValid(restockId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Restock ID format");
    }

    const restockRecord = await BooksRestockModel.findById(restockId);
    if (!restockRecord) {
      throw new ApiError(httpStatus.NOT_FOUND, "Restock record not found");
    }

    const originalQuantity = restockRecord.quantity_purchased;
    await BooksRestockModel.findByIdAndDelete(restockId);

    const bookRecord = await BooksModel.findById(restockRecord.book);
    if (bookRecord) {
      bookRecord.current_quantity -= originalQuantity;
      bookRecord.total_quantity -= originalQuantity;
      bookRecord.status =
        bookRecord.current_quantity <= bookRecord.min_stock_level
          ? "Low Stock"
          : "In Stock";
      await bookRecord.save();
    }

    return { msg: "Restock record deleted successfully" };
  }

  // Get all restocks
  static async GetAllRestocks(filters = {}) {
    const query = {};

    // Filter by book
    if (filters.book) {
      const matchingBooks = await BooksModel.find({
        $or: [
          { item_code: { $regex: filters.book, $options: "i" } },
          { item_name: { $regex: filters.book, $options: "i" } },
        ],
      }).select("_id");

      query.book = { $in: matchingBooks.map((c) => c._id) };
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


    // Filter by expiration date (Exact match, before, or after)
    if (filters.createdAt) {
      const date = new Date(filters.createdAt);
      query.createdAt = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }


    // Fetch and populate restocks
    const restocks = await BooksRestockModel.find(query)
      .populate("book", "item_code item_name") // Populate book details
      .populate("inward", "inward_code") // Populate inward_code correctly
      .sort({ createdAt: -1 });


    return restocks;
  }

  // Delete a Books item and its associated restocks and logs
  static async DeleteBooksItem(user, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item ID format");
    }

    const book = await BooksModel.findById(id);
    if (!book) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Books item not found in the record"
      );
    }

    // Delete associated restock records
    await BooksRestockModel.deleteMany({ book: id });

    // Delete associated logs
    await BooksLogModel.deleteMany({ item: id });

    // Finally, delete the book item itself
    await BooksModel.findByIdAndDelete(id);

    return {
      msg: "Item and associated restocks and logs deleted successfully",
    };
  }

  // Get a Books item by its ID
  static async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid item ID format");
    }

    const item = await BooksModel.findById(id);
    if (!item) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Books item not found in the record"
      );
    }

    return { item };
  }



  static async GetAllItems(filters = {}) {
    const query = {}; // Initialize an empty query object

    // Add individual fields to the query object if they are present in the filters
    if (filters.item_code) query.item_code = { $regex: filters.item_code, $options: "i" };
    if (filters.item_name) query.item_name = { $regex: filters.item_name, $options: "i" };
    if (filters.author) query.author = { $regex: filters.author, $options: "i" };
    if (filters.location) query.location = { $regex: filters.location, $options: "i" };
    if (filters.status) query.status = { $regex: filters.status, $options: "i" };

    const data = await BooksModel.find(query).select(
      "item_code item_name author location edition publisher createdAt description total_quantity current_quantity min_stock_level updatedAt status "
    );

    const totalBooks = data.length;

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
      total: totalBooks,
    };
  }



  static async UpdateBooksItemById(user, body, id) {
    const {
      item_name,
      author,
      location,
      publisher,
      min_stock_level,
edition,
      description,

    } = body;

    const existingItem = await BooksModel.findById(id);
    if (!existingItem) {
      throw new ApiError(httpStatus.NOT_FOUND, "Books item not found");
    }

    const updatedData = {
      item_name,
      author,
      location,
      publisher,
      min_stock_level,
edition,
      description,
    };


    await BooksModel.findByIdAndUpdate(id, updatedData, { new: true });

    return { msg: "Books item updated successfully" };
  }

  // Get Books items for search
  static async GetBooksItemForSearch() {
    const data = await BooksModel.find({}).select(
      "item_code author item_name company"
    );

    return {
      items: data,
    };
  }

  static async GetLogs(filters) {

    const query = {};

    // Construct OR query for item_code and item_name
    let bookQuery = [];

    if (filters.item_code) {
      bookQuery.push({ item_code: { $regex: filters.item_code, $options: "i" } });
    }
    if (filters.item_name) {
      bookQuery.push({ item_name: { $regex: filters.item_name, $options: "i" } });
    }

    if (bookQuery.length > 0) {
      const book = await BooksModel.findOne({ $or: bookQuery }).select("_id");

      if (!book) {
        console.log("No matching book found for given item_code or item_name");
        return []; // Exit early to prevent incorrect logs from being returned
      }

      query.item = book._id;
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

    let logs = await BooksLogModel.find(query)
    .populate("item", "item_code item_name")
    .sort({ date_issued: -1 });

  
    // Process logs to get request_code based on request_model
    logs = await Promise.all(
      logs.map(async (log) => {
        if (log.request && log.request_model) {
          log = log.toObject(); // Convert Mongoose document to plain object
          let requestCode = null;

          console.log(`Processing log with request_model: ${log.request_model}, request: ${log.request}`);

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

    const book = await BooksModel.findById(item_id);
    if (!book) {
      throw new ApiError(httpStatus.NOT_FOUND, "Book item not found");
    }

    if (book.current_quantity < issued_quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Issued quantity exceeds current stock."
      );
    }

    // Log the issued quantity
    const logEntry = new BooksLogModel({
      item: item_id,
      request_model: request_model,
      request: request,
      issued_quantity,
      date_issued,
      user_email,
    });

    await logEntry.save();

    // Update the stock quantity
    book.current_quantity -= issued_quantity;

    // Handle stock notifications
    if (book.current_quantity === 0) {
      book.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: book._id,
        title: `Out of Stock Alert: ${book.item_name}`,
        message: `The book ${book.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });

      await StockNotificationService.deleteMany({
        itemId: book._id,
        type: "stock_recovered",
      });

    } else if (book.current_quantity <= book.min_stock_level) {
      book.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: book._id,
        title: `Low Stock Alert: ${book.item_name}`,
        message: `The stock for ${book.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });

      await StockNotificationService.deleteMany({
        itemId: book._id,
        type: "stock_recovered",
      });

    } else {
      book.status = "In Stock";
    }

    await book.save();


    return logEntry;
  }


  static async UpdateBookLogItemById(logId, newIssuedQuantity, user_email, date_issued, date_return) {
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
    }

    const logEntry = await BooksLogModel.findById(logId).populate("item");
    if (!logEntry) {
      throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
    }

    const book = logEntry.item;
    const existingQuantity = logEntry.issued_quantity;

    if (typeof newIssuedQuantity !== "number" || newIssuedQuantity < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid issued quantity.");
    }

    const quantityDifference = newIssuedQuantity - existingQuantity;

    book.current_quantity -= quantityDifference;

    if (book.current_quantity < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Issued quantity exceeds current stock.");
    }

    // Track whether we need to send a stock recovery notification
    let stockRecoveryNotificationSent = false;

    // Trigger notifications based on updated stock levels
    if (book.current_quantity === 0) {
      book.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: book._id,
        title: `Out of Stock Alert: ${book.item_name}`,
        message: `The book ${book.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: book._id,
        type: "stock_recovered",
      });

    } else if (book.current_quantity <= book.min_stock_level) {
      book.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: book._id,
        title: `Low Stock Alert: ${book.item_name}`,
        message: `The stock for ${book.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: book._id,
        type: "stock_recovered",
      });

    } else {
      // If the stock has recovered to be "In Stock", create a new notification
      if (book.status === "Out of Stock" || book.status === "Low Stock") {
        book.status = "In Stock";
        stockRecoveryNotificationSent = true;
        await StockNotificationService.createNotification({
          itemId: book._id,
          title: `Stock Recovery: ${book.item_name}`,
          message: `The book ${book.item_name} is now back in stock and no longer out of stock or low stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "stock_recovered",
        });
      }
    }

    await book.save();

    // Proceed with the log entry update
    if (!date_issued || isNaN(new Date(date_issued).getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date issued.");
    }

    // Proceed with the log entry update
    if (date_return || new Date(date_return).getTime()) {
      logEntry.date_return = new Date(date_return);

    }
    logEntry.issued_quantity = newIssuedQuantity;
    logEntry.user_email = user_email;
    logEntry.date_issued = new Date(date_issued);
    await logEntry.save();

    return { msg: "Book log updated successfully", stockRecoveryNotificationSent };
  }


  static async DeleteBooksLogItem(logId) {
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Log ID must be a valid MongoDB ObjectId");
    }

    const logEntry = await BooksLogModel.findById(logId).populate("item");
    if (!logEntry) {
      throw new ApiError(httpStatus.NOT_FOUND, "Log entry not found");
    }

    const book = logEntry.item;

    // Revert the issued quantity back to stock
    book.current_quantity += logEntry.issued_quantity;

    let stockRecoveryNotificationSent = false;

    // Check the stock status after deletion and trigger necessary notifications
    if (book.current_quantity === 0) {
      book.status = "Out of Stock";
      await StockNotificationService.createNotification({
        itemId: book._id,
        title: `Out of Stock Alert: ${book.item_name}`,
        message: `The book ${book.item_name} is now out of stock.`,
        send_to: ["admin", "lab-assistant"],
        type: "out_of_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: book._id,
        type: "stock_recovered",
      });

    } else if (book.current_quantity <= book.min_stock_level) {
      book.status = "Low Stock";
      await StockNotificationService.createNotification({
        itemId: book._id,
        title: `Low Stock Alert: ${book.item_name}`,
        message: `The stock for ${book.item_name} is below the minimum level.`,
        send_to: ["admin", "lab-assistant"],
        type: "low_stock",
      });


      // Delete "Stock Recovery" notifications since the stock is now low
      await StockNotificationService.deleteMany({
        itemId: book._id,
        type: "stock_recovered",
      });

    } else {
      // If the stock has recovered to be "In Stock", create a new notification
      if (book.status === "Out of Stock" || book.status === "Low Stock") {
        book.status = "In Stock";
        stockRecoveryNotificationSent = true;
        await StockNotificationService.createNotification({
          itemId: book._id,
          title: `Stock Recovery: ${book.item_name}`,
          message: `The book ${book.item_name} is now back in stock and no longer out of stock or low stock.`,
          send_to: ["admin", "lab-assistant"],
          type: "stock_recovered",
        });
      }
    }

    await book.save();

    // Delete the log entry
    await BooksLogModel.findByIdAndDelete(logId);

    return { msg: "Log entry deleted successfully", stockRecoveryNotificationSent };
  }

}

module.exports = BooksService;

