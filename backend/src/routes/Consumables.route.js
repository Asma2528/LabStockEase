const express = require("express");
const Authentication = require("../middlewares/Authentication");
const ConsumablesController = require("../controllers/ConsumablesController");
const ConsumablesValidation = require("../validations/Consumables.validation");
const Validation = require("../middlewares/Validation");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(Authentication);

// Route to get all Consumables items without pagination
router.get("/get-all", ConsumablesController.GetAllItems);

// Route to register a new Consumables item
router.post("/register", ConsumablesValidation.RegisterConsumables, Validation, ConsumablesController.RegisterConsumablesItem);

// Route to get a Consumables item by its ID
router.get("/get/:id", ConsumablesValidation.Params_id, Validation, ConsumablesController.getById);

router.get("/get-item-codes/:id", ConsumablesValidation.Params_id, Validation, ConsumablesController.getItemCodesByClass);

// Route to update a Consumables item by its ID
router.patch("/update/:id", ConsumablesValidation.RegisterConsumables, Validation, ConsumablesController.updateById);

// Route to delete a Consumables item by its ID
router.delete("/delete/:id", ConsumablesValidation.Params_id, Validation, ConsumablesController.DeleteConsumablesItem);


// Route to register a log for issued consumabless
router.post(
  "/register-log",
  ConsumablesValidation.LogIssuedQuantity,  // Validation for logging quantity
  Validation,  // General validation middleware
  ConsumablesController.LogIssuedQuantity  // Controller to handle logging
);

// Route to get all logs
router.get("/get-all-logs", ConsumablesController.GetLogs);


// Route to update a log
router.patch("/update-log/:id",  ConsumablesValidation.LogUpdateIssuedQuantity, Validation, ConsumablesController.updateLogById);

// Route to delete a log
router.delete("/delete-log/:id", ConsumablesValidation.Params_id, Validation, ConsumablesController.DeleteConsumablesLogItem);

// Restock a consumables item
router.post("/restock", ConsumablesValidation.RestockConsumable, Validation, ConsumablesController.RestockConsumable);

// Route to get all restock records
router.get('/restock/get-all', ConsumablesController.GetAllRestocks);

// Route to update a restock record
router.patch("/restock/:id", ConsumablesValidation.RestockConsumable, Validation, ConsumablesController.UpdateRestockRecordById);

// Route to delete a restock record
router.delete("/restock/:id", ConsumablesValidation.Params_id, Validation, ConsumablesController.DeleteRestockRecordById);

// Route to get consumables by code or name
router.get('/get-consumables-by-code-or-name', ConsumablesController.GetConsumableByCodeOrName);




module.exports = router;
