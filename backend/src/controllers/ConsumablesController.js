const httpStatus = require("http-status");
const CatchAsync = require("../utils/CatchAsync");
const ConsumablesService = require("../services/Consumables.service");
const { ConsumablesModel } = require('../models');

class ConsumablesController {
    // Register a new Consumables item
    static RegisterConsumablesItem = CatchAsync(async (req, res) => {
        const res_obj = await ConsumablesService.RegisterConsumablesItem(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Get a Consumables item by its ID
    static getById = CatchAsync(async (req, res) => {
        const { id } = req.params;

        if (!id || id.length !== 24) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid ID format" });
        }

        const res_obj = await ConsumablesService.getById(id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    static async getItemCodesByClass(className) {
    if (className !== "Consumable") {
      return [];
    }

    const itemCodes = await ConsumablesModel.find({}, "item_code").lean();
    return itemCodes.map((item) => item.item_code);
  }

  static getItemCodesByClass = CatchAsync(async (req, res) => {
    const { className } = req.query;
    const itemCodes = await ConsumablesService.getItemCodesByClass(className);
    return res.status(httpStatus.OK).json({ itemCodes });
  });

// Get all Consumables items controller code
static GetAllItems = CatchAsync(async (req, res) => {
    try {
        const filters = {
            item_code: req.query.item_code,
            casNo: req.query.casNo,
            item_name: req.query.item_name,
            company: req.query.company,
            status: req.query.status,
            purpose: req.query.purpose,
            unit_of_measure: req.query.unit_of_measure,
            description: req.query.description
        };
        
        const result = await ConsumablesService.GetAllItems(filters); // Pass filters to the service method
        res.json(result);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});

    
    // Update a Consumables item by its ID
    static updateById = CatchAsync(async (req, res) => {
        const res_obj = await ConsumablesService.UpdateConsumablesItemById(req?.user, req.body, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a Consumables item by its ID
    static DeleteConsumablesItem = CatchAsync(async (req, res) => {
        const res_obj = await ConsumablesService.DeleteConsumablesItem(req?.user, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });


    // Log issued quantities
    static LogIssuedQuantity = CatchAsync(async (req, res) => {
        const { item_id, request_model,request, issued_quantity, date_issued, user_email } = req.body;
        const logEntry = await ConsumablesService.LogIssuedQuantity(item_id, request_model, request, issued_quantity, date_issued, user_email);
        return res.status(httpStatus.CREATED).json(logEntry);
    });

// Controller function in ConsumablesController.js
static GetLogs = CatchAsync(async (req, res) => {
    const { item_code, item_name, user_email, date_issued } = req.query;
    const filters = { item_code, item_name, user_email, date_issued};
    const logs = await ConsumablesService.GetLogs(filters);
    return res.status(httpStatus.OK).json(logs);
});

  

    static updateLogById = CatchAsync(async (req, res) => {
        const { issued_quantity, user_email, date_issued } = req.body;
        const logId = req.params.id;

        if (typeof issued_quantity !== 'number' || issued_quantity < 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid issued quantity." });
        }

        const res_obj = await ConsumablesService.UpdateConsumableLogItemById(logId, issued_quantity, user_email, date_issued);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a Consumables log item by its ID
    static DeleteConsumablesLogItem = CatchAsync(async (req, res) => {
        const logId = req.params.id;
        const res_obj = await ConsumablesService.DeleteConsumablesLogItem(logId);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Register a purchase for restocking a consumable
    static RestockConsumable = CatchAsync(async (req, res) => {
        const res_obj = await ConsumablesService.RestockConsumable(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Controller function to get all restock records with search filters
static GetAllRestocks = CatchAsync(async (req, res) => {
    const restocks = await ConsumablesService.GetAllRestocks(req.query);
    return res.status(httpStatus.OK).json(restocks);
});


    // Update a restock record by ID
    static UpdateRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await ConsumablesService.UpdateRestockRecordById(req.params.id, req.body);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a restock record by ID
    static DeleteRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await ConsumablesService.DeleteRestockRecordById(req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    static GetConsumableByCodeOrName = CatchAsync(async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Query is required" });
        }

        const consumable = await ConsumablesModel.findOne({
            $or: [{ item_code: query }, { item_name: query }]
        }).select('item_code item_name');

        if (!consumable) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Consumable not found" });
        }

        return res.status(httpStatus.OK).json(consumable);
    });

     
}

module.exports = ConsumablesController;
