const httpStatus = require("http-status");
const CatchAsync = require("../utils/CatchAsync");
const BooksService = require("../services/Books.service");
const { BooksModel } = require('../models');

class BooksController {
    // Register a new Books item
    static RegisterBooksItem = CatchAsync(async (req, res) => {
        const res_obj = await BooksService.RegisterBooksItem(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Get a Books item by its ID
    static getById = CatchAsync(async (req, res) => {
        const { id } = req.params;

        if (!id || id.length !== 24) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid ID format" });
        }

        const res_obj = await BooksService.getById(id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    static async getItemCodesByClass(className) {
    if (className !== "Book") {
      return [];
    }

    const itemCodes = await BooksModel.find({}, "item_code").lean();
    return itemCodes.map((item) => item.item_code);
  }

  static getItemCodesByClass = CatchAsync(async (req, res) => {
    const { className } = req.query;
    const itemCodes = await BooksService.getItemCodesByClass(className);
    return res.status(httpStatus.OK).json({ itemCodes });
  });

// Get all Books items controller code
static GetAllItems = CatchAsync(async (req, res) => {
    try {
        const filters = {
            item_code: req.query.item_code,
            location: req.query.location,
            item_name: req.query.item_name,
            author: req.query.author,
            status: req.query.status,
        };
        
        const result = await BooksService.GetAllItems(filters); // Pass filters to the service method
        res.json(result);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});

    
    // Update a Books item by its ID
    static updateById = CatchAsync(async (req, res) => {
        const res_obj = await BooksService.UpdateBooksItemById(req?.user, req.body, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a Books item by its ID
    static DeleteBooksItem = CatchAsync(async (req, res) => {
        const res_obj = await BooksService.DeleteBooksItem(req?.user, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });


    // Log issued quantities
    static LogIssuedQuantity = CatchAsync(async (req, res) => {
        const { item_id, request_model,request, issued_quantity, date_issued, user_email } = req.body;
        const logEntry = await BooksService.LogIssuedQuantity(item_id, request_model, request, issued_quantity, date_issued, user_email);
        return res.status(httpStatus.CREATED).json(logEntry);
    });

// Controller function in BooksController.js
static GetLogs = CatchAsync(async (req, res) => {
    const { item_code, item_name, user_email, date_issued } = req.query;
    const filters = { item_code, item_name, user_email, date_issued};
    const logs = await BooksService.GetLogs(filters);
    return res.status(httpStatus.OK).json(logs);
});

  

    static updateLogById = CatchAsync(async (req, res) => {
        const { issued_quantity, user_email, date_issued, date_return } = req.body;
        const logId = req.params.id;

        if (typeof issued_quantity !== 'number' || issued_quantity < 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid issued quantity." });
        }

        const res_obj = await BooksService.UpdateBookLogItemById(logId, issued_quantity, user_email, date_issued, date_return);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a Books log item by its ID
    static DeleteBooksLogItem = CatchAsync(async (req, res) => {
        const logId = req.params.id;
        const res_obj = await BooksService.DeleteBooksLogItem(logId);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Register a purchase for restocking a book
    static RestockBook = CatchAsync(async (req, res) => {
        const res_obj = await BooksService.RestockBook(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Controller function to get all restock records with search filters
static GetAllRestocks = CatchAsync(async (req, res) => {
    const restocks = await BooksService.GetAllRestocks(req.query);
    return res.status(httpStatus.OK).json(restocks);
});


    // Update a restock record by ID
    static UpdateRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await BooksService.UpdateRestockRecordById(req.params.id, req.body);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a restock record by ID
    static DeleteRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await BooksService.DeleteRestockRecordById(req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    static GetBookByCodeOrName = CatchAsync(async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Query is required" });
        }

        const book = await BooksModel.findOne({
            $or: [{ item_code: query }, { item_name: query }]
        }).select('item_code item_name');

        if (!book) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Book not found" });
        }

        return res.status(httpStatus.OK).json(book);
    });

     
}

module.exports = BooksController;
