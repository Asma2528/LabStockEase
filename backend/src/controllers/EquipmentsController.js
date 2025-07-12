const httpStatus = require("http-status");
const CatchAsync = require("../utils/CatchAsync");
const EquipmentsService = require("../services/Equipments.service");
const { EquipmentsModel } = require('../models');

class EquipmentsController {
    // Register a new Equipment item
    static RegisterEquipmentsItem = CatchAsync(async (req, res) => {
        const res_obj = await EquipmentsService.RegisterEquipmentItem(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Get an Equipment item by its ID
    static getById = CatchAsync(async (req, res) => {
        const { id } = req.params;

        if (!id || id.length !== 24) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid ID format" });
        }

        const res_obj = await EquipmentsService.getById(id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Get item codes by class (only for Equipment)
    static getItemCodesByClass = CatchAsync(async (req, res) => {
        const { className } = req.query;
        const itemCodes = await EquipmentsService.getItemCodesByClass(className);
        return res.status(httpStatus.OK).json({ itemCodes });
    });

    // Get all Equipment items with optional filters
    static GetAllItems = CatchAsync(async (req, res) => {
        try {
            const filters = {
                item_code: req.query.item_code,
                model_number: req.query.model_number,
                serial_number: req.query.serial_number,
                item_name: req.query.item_name,
                manual:req.query.manual,
                company: req.query.company,
                status: req.query.status,
                purpose: req.query.purpose,
                unit_of_measure: req.query.unit_of_measure,
                description: req.query.description
            };

            const result = await EquipmentsService.GetAllItems(filters);
            res.json(result);
        } catch (error) {
            console.error('Error fetching items:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
        }
    });

    // Update an Equipment item by its ID
    static updateById = CatchAsync(async (req, res) => {
        const res_obj = await EquipmentsService.UpdateEquipmentsItemById(req?.user, req.body, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete an Equipment item by its ID
    static DeleteEquipmentsItem = CatchAsync(async (req, res) => {
        const res_obj = await EquipmentsService.DeleteEquipmentItem(req?.user, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Log issued quantities for Equipment
    static LogIssuedQuantity = CatchAsync(async (req, res) => {
        const { item_id, request_model, request, issued_quantity, date_issued, user_email } = req.body;
        const logEntry = await EquipmentsService.LogIssuedQuantity(item_id, request_model, request, issued_quantity, date_issued, user_email);
        return res.status(httpStatus.CREATED).json(logEntry);
    });

    // Get logs for issued Equipment
    static GetLogs = CatchAsync(async (req, res) => {
        const { item_code, item_name, user_email, date_issued } = req.query;
        const filters = { item_code, item_name, user_email, date_issued };
        const logs = await EquipmentsService.GetLogs(filters);
        return res.status(httpStatus.OK).json(logs);
    });

    // Update a log by its ID
    static updateLogById = CatchAsync(async (req, res) => {
        const { issued_quantity, user_email, date_issued } = req.body;
        const logId = req.params.id;

        if (typeof issued_quantity !== 'number' || issued_quantity < 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid issued quantity." });
        }

        const res_obj = await EquipmentsService.UpdateEquipmentLogItemById(logId, issued_quantity, user_email, date_issued);
        return res.status(httpStatus.OK).json(res_obj);
    });

     // Update a log by its ID
     static returnLogById = CatchAsync(async (req, res) => {
        const { returned_quantity, lost_or_damaged_quantity, date_returned } = req.body;
        const logId = req.params.id;

        if (typeof returned_quantity !== 'number' || returned_quantity < 0 && typeof lost_or_damaged_quantity !== 'number' || lost_or_damaged_quantity < 0 ) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid returned or lost/damaged quantity." });
        }

        const res_obj = await EquipmentsService.ReturnEquipmentLogItemById(logId,returned_quantity, lost_or_damaged_quantity, date_returned);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete an Equipment log item by its ID
    static DeleteEquipmentsLogItem = CatchAsync(async (req, res) => {
        const logId = req.params.id;
        const res_obj = await EquipmentsService.DeleteEquipmentsLogItem(logId);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Register a purchase for restocking an Equipment item
    static RestockEquipment = CatchAsync(async (req, res) => {
        const res_obj = await EquipmentsService.RestockEquipment(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Get all restock records with search filters
    static GetAllRestocks = CatchAsync(async (req, res) => {
        const restocks = await EquipmentsService.GetAllRestocks(req.query);
        return res.status(httpStatus.OK).json(restocks);
    });

    // Update a restock record by ID
    static UpdateRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await EquipmentsService.UpdateRestockRecordById(req.params.id, req.body);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a restock record by ID
    static DeleteRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await EquipmentsService.DeleteRestockRecordById(req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Get Equipment item by code or name
    static GetEquipmentByCodeOrName = CatchAsync(async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Query is required" });
        }

        const equipment = await EquipmentsModel.findOne({
            $or: [{ item_code: query }, { item_name: query }]
        }).select('item_code item_name');

        if (!equipment) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Equipment not found" });
        }

        return res.status(httpStatus.OK).json(equipment);
    });
}

module.exports = EquipmentsController;
