const httpStatus = require("http-status");
const CatchAsync = require("../utils/CatchAsync");
const GlasswaresService = require("../services/Glasswares.service");
const { GlasswaresModel } = require('../models');

class GlasswaresController {
    // Register a new Glasswares item
    static RegisterGlasswaresItem = CatchAsync(async (req, res) => {
        const res_obj = await GlasswaresService.RegisterGlasswaresItem(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Get a Glasswares item by its ID
    static getById = CatchAsync(async (req, res) => {
        const { id } = req.params;

        if (!id || id.length !== 24) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid ID format" });
        }

        const res_obj = await GlasswaresService.getById(id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    static async getItemCodesByClass(className) {
    if (className !== "Glassware") {
      return [];
    }

    const itemCodes = await GlasswaresModel.find({}, "item_code").lean();
    return itemCodes.map((item) => item.item_code);
  }

  static getItemCodesByClass = CatchAsync(async (req, res) => {
    const { className } = req.query;
    const itemCodes = await GlasswaresService.getItemCodesByClass(className);
    return res.status(httpStatus.OK).json({ itemCodes });
  });

  static returnLogById = CatchAsync(async (req, res) => {
    const { returned_quantity, lost_or_damaged_quantity, date_returned } = req.body;
    const logId = req.params.id;

    if (typeof returned_quantity !== 'number' || returned_quantity < 0 && typeof lost_or_damaged_quantity !== 'number' || lost_or_damaged_quantity < 0 ) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid returned or lost/damaged quantity." });
    }

    const res_obj = await GlasswaresService.ReturnGlasswareLogItemById(logId,returned_quantity, lost_or_damaged_quantity, date_returned);
    return res.status(httpStatus.OK).json(res_obj);
});


// Get all Glasswares items controller code
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
        
        const result = await GlasswaresService.GetAllItems(filters); // Pass filters to the service method
        res.json(result);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});

    
    // Update a Glasswares item by its ID
    static updateById = CatchAsync(async (req, res) => {
        const res_obj = await GlasswaresService.UpdateGlasswaresItemById(req?.user, req.body, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a Glasswares item by its ID
    static DeleteGlasswaresItem = CatchAsync(async (req, res) => {
        const res_obj = await GlasswaresService.DeleteGlasswaresItem(req?.user, req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });


    // Log issued quantities
    static LogIssuedQuantity = CatchAsync(async (req, res) => {
        const { item_id, request_model,request, issued_quantity, date_issued, user_email } = req.body;
        const logEntry = await GlasswaresService.LogIssuedQuantity(item_id, request_model, request, issued_quantity, date_issued, user_email);
        return res.status(httpStatus.CREATED).json(logEntry);
    });

// Controller function in GlasswaresController.js
static GetLogs = CatchAsync(async (req, res) => {
    const { item_code, item_name, user_email, date_issued } = req.query;
    const filters = { item_code, item_name, user_email, date_issued};
    const logs = await GlasswaresService.GetLogs(filters);
    return res.status(httpStatus.OK).json(logs);
});

  

    static updateLogById = CatchAsync(async (req, res) => {
        const { issued_quantity, user_email, date_issued } = req.body;
        const logId = req.params.id;

        if (typeof issued_quantity !== 'number' || issued_quantity < 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid issued quantity." });
        }

        const res_obj = await GlasswaresService.UpdateGlasswareLogItemById(logId, issued_quantity, user_email, date_issued);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a Glasswares log item by its ID
    static DeleteGlasswaresLogItem = CatchAsync(async (req, res) => {
        const logId = req.params.id;
        const res_obj = await GlasswaresService.DeleteGlasswaresLogItem(logId);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Register a purchase for restocking a glassware
    static RestockGlassware = CatchAsync(async (req, res) => {
        const res_obj = await GlasswaresService.RestockGlassware(req?.user, req.body);
        return res.status(httpStatus.CREATED).json(res_obj);
    });

    // Controller function to get all restock records with search filters
static GetAllRestocks = CatchAsync(async (req, res) => {
    const restocks = await GlasswaresService.GetAllRestocks(req.query);
    return res.status(httpStatus.OK).json(restocks);
});


    // Update a restock record by ID
    static UpdateRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await GlasswaresService.UpdateRestockRecordById(req.params.id, req.body);
        return res.status(httpStatus.OK).json(res_obj);
    });

    // Delete a restock record by ID
    static DeleteRestockRecordById = CatchAsync(async (req, res) => {
        const res_obj = await GlasswaresService.DeleteRestockRecordById(req.params.id);
        return res.status(httpStatus.OK).json(res_obj);
    });

    static GetGlasswareByCodeOrName = CatchAsync(async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Query is required" });
        }

        const glassware = await GlasswaresModel.findOne({
            $or: [{ item_code: query }, { item_name: query }]
        }).select('item_code item_name');

        if (!glassware) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Glassware not found" });
        }

        return res.status(httpStatus.OK).json(glassware);
    });

     
}

module.exports = GlasswaresController;
