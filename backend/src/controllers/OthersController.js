const httpStatus = require("http-status");
const CatchAsync = require("../utils/CatchAsync");
const OthersService = require("../services/Others.service");
const { OthersModel } = require('../models');

class OthersController {
    /**
     * Register a new Others item
     */
    static RegisterOthersItem = CatchAsync(async (req, res) => {
        const res_obj = await OthersService.RegisterOthersItem(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    /**
     * Get an Others item by its ID
     */
    static getById = CatchAsync(async (req, res) => {
        const { id } = req.params;

        if (!id || id.length !== 24) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid ID format" });
        }

        const res_obj = await OthersService.getById(id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    /**
     * Fetch item codes based on class
     */
    static async getItemCodesByClass(className) {
        if (className !== "Others") {
            return [];
        }

        const itemCodes = await OthersModel.find({}, "item_code").lean();
        return itemCodes.map((item) => item.item_code);
    }

    static getItemCodesByClass = CatchAsync(async (req, res) => {
        const { className } = req.query;
        const itemCodes = await OthersService.getItemCodesByClass(className);
        return res.status(httpStatus.OK).json({ itemCodes });
    });

    /**
     * Get all Others items
     */
    static GetAllItems = CatchAsync(async (req, res) => {
        try {
            const filters = {
                item_code: req.query.item_code,
                item_name: req.query.item_name,
                category: req.query.category,
                company: req.query.company,
                status: req.query.status,
                purpose: req.query.purpose,
                unit_of_measure: req.query.unit_of_measure,
                description: req.query.description
            };

            const result = await OthersService.GetAllItems(filters);
            res.json(result);
        } catch (error) {
            console.error('Error fetching items:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
        }
    });

    /**
     * Update an Others item by ID
     */
    static updateById = CatchAsync(async (req, res) => {
        const res_obj = await OthersService.UpdateOthersItemById(req?.user, req.body, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    /**
     * Delete an Others item by ID
     */
    static DeleteOthersItem = CatchAsync(async (req, res) => {
        const res_obj = await OthersService.DeleteOthersItem(req?.user, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    /**
     * Log issued quantity
     */
    static LogIssuedQuantity = CatchAsync(async (req, res) => {
        const { item_id, request_model, request, issued_quantity, date_issued, user_email } = req.body;
        const logEntry = await OthersService.LogIssuedQuantity(item_id, request_model, request, issued_quantity, date_issued, user_email);
        return res.status(httpStatus.CREATED).json(logEntry);
    });

    /**
     * Get logs for issued Others items
     */
    static GetLogs = CatchAsync(async (req, res) => {
        const { item_code, item_name, user_email, date_issued } = req.query;
        const filters = { item_code, item_name, user_email, date_issued };
        const logs = await OthersService.GetLogs(filters);
        return res.status(httpStatus.OK).json(logs);
    });

    /**
     * Update a log by ID
     */
    static UpdateOtherLogItemById = CatchAsync(async (req, res) => {
        const { issued_quantity, user_email, date_issued } = req.body;
        const logId = req.params.id;

        if (typeof issued_quantity !== 'number' || issued_quantity < 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid issued quantity." });
        }

        const res_obj = await OthersService.UpdateOtherLogItemById(logId, issued_quantity, user_email, date_issued);
        return res.status(httpStatus.OK).json(res_obj);
    });

    /**
     * Delete an issued log item by ID
     */
    static DeleteOthersLogItem = CatchAsync(async (req, res) => {
        const logId = req.params.id;
        const res_obj = await OthersService.DeleteOthersLogItem(logId);
        return res.status(httpStatus.OK).json(res_obj);
    });

    /**
     * Restock an Others item
     */
    static RestockOthers = CatchAsync(async (req, res) => {
        const res_obj = await OthersService.RestockOther(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    /**
     * Get all restock records with filters
     */
    static GetAllRestocks = CatchAsync(async (req, res) => {
        const restocks = await OthersService.GetAllRestocks(req.query);
        return res.status(httpStatus.OK).json(restocks);
    });

    /**
     * Update a restock record by ID
     */
    static UpdateRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await OthersService.UpdateRestockRecordById(req.params.id, req.body);
        return res.status(httpStatus.OK).json(res_obj);
    });

    /**
     * Delete a restock record by ID
     */
    static DeleteRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await OthersService.DeleteRestockRecordById(req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    /**
     * Get an Others item by item code or name
     */
    static GetOthersByCodeOrName = CatchAsync(async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Query is required" });
        }

        const otherItem = await OthersModel.findOne({
            $or: [{ item_code: query }, { item_name: query }]
        }).select('item_code item_name');

        if (!otherItem) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Item not found" });
        }

        return res.status(httpStatus.OK).json(otherItem);
    });
}

module.exports = OthersController;
