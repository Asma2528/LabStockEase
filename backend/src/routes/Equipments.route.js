const express = require("express");
const Authentication = require("../middlewares/Authentication");
const EquipmentsController = require("../controllers/EquipmentsController");
const EquipmentsValidation = require("../validations/Equipments.validation");
const Validation = require("../middlewares/Validation");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(Authentication);

// Route to get all Equipments items without pagination
router.get("/get-all", EquipmentsController.GetAllItems);

// Route to register a new Equipments item
router.post("/register", EquipmentsValidation.RegisterEquipments, Validation, EquipmentsController.RegisterEquipmentsItem);

// Route to get a Equipments item by its ID
router.get("/get/:id", EquipmentsValidation.Params_id, Validation, EquipmentsController.getById);

router.get("/get-item-codes/:id", EquipmentsValidation.Params_id, Validation, EquipmentsController.getItemCodesByClass);

// Route to update a Equipments item by its ID
router.patch("/update/:id", EquipmentsValidation.RegisterEquipments, Validation, EquipmentsController.updateById);

// Route to delete a Equipments item by its ID
router.delete("/delete/:id", EquipmentsValidation.Params_id, Validation, EquipmentsController.DeleteEquipmentsItem);


// Route to register a log for issued equipments
router.post(
  "/register-log",
  EquipmentsValidation.LogIssuedQuantity,  // Validation for logging quantity
  Validation,  // General validation middleware
  EquipmentsController.LogIssuedQuantity  // Controller to handle logging
);

// Route to get all logs
router.get("/get-all-logs", EquipmentsController.GetLogs);

router.patch("/return-log/:id",  Validation, EquipmentsController.returnLogById);


// Route to update a log
router.patch("/update-log/:id",  EquipmentsValidation.LogUpdateIssuedQuantity,  Validation, EquipmentsController.updateLogById);

// Route to delete a log
router.delete("/delete-log/:id", EquipmentsValidation.Params_id, Validation, EquipmentsController.DeleteEquipmentsLogItem);

// Restock a equipment item
router.post("/restock", EquipmentsValidation.RestockEquipment, Validation, EquipmentsController.RestockEquipment);

// Route to get all restock records
router.get('/restock/get-all', EquipmentsController.GetAllRestocks);

// Route to update a restock record
router.patch("/restock/:id", EquipmentsValidation.RestockEquipment, Validation, EquipmentsController.UpdateRestockRecordById);

// Route to delete a restock record
router.delete("/restock/:id", EquipmentsValidation.Params_id, Validation, EquipmentsController.DeleteRestockRecordById);

// Route to get equipment by code or name
router.get('/get-equipment-by-code-or-name', EquipmentsController.GetEquipmentByCodeOrName);




module.exports = router;
