const express = require("express");
const Authentication = require("../middlewares/Authentication");
const ChemicalsController = require("../controllers/ChemicalsController");
const ChemicalsValidation = require("../validations/Chemicals.validation");
const Validation = require("../middlewares/Validation");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(Authentication);

// Route to get all Chemicals items without pagination
router.get("/get-all", ChemicalsController.GetAllItems);

// Route to register a new Chemicals item
router.post("/register", ChemicalsValidation.RegisterChemicals, Validation, ChemicalsController.RegisterChemicalsItem);

// Route to get a Chemicals item by its ID
router.get("/get/:id", ChemicalsValidation.Params_id, Validation, ChemicalsController.getById);

router.get("/get-item-codes/:id", ChemicalsValidation.Params_id, Validation, ChemicalsController.getItemCodesByClass);

// Route to update a Chemicals item by its ID
router.patch("/update/:id", ChemicalsValidation.RegisterChemicals, Validation, ChemicalsController.updateById);

// Route to delete a Chemicals item by its ID
router.delete("/delete/:id", ChemicalsValidation.Params_id, Validation, ChemicalsController.DeleteChemicalsItem);


// Route to register a log for issued chemicals
router.post(
  "/register-log",
  ChemicalsValidation.LogIssuedQuantity,  // Validation for logging quantity
  Validation,  // General validation middleware
  ChemicalsController.LogIssuedQuantity  // Controller to handle logging
);

// Route to get all logs
router.get("/get-all-logs", ChemicalsController.GetLogs);


// Route to update a log
router.patch("/update-log/:id",  ChemicalsValidation.LogUpdateIssuedQuantity, Validation, ChemicalsController.updateLogById);

// Route to delete a log
router.delete("/delete-log/:id", ChemicalsValidation.Params_id, Validation, ChemicalsController.DeleteChemicalsLogItem);

// Restock a chemical item
router.post("/restock", ChemicalsValidation.RestockChemical, Validation, ChemicalsController.RestockChemical);

// Route to get all restock records
router.get('/restock/get-all', ChemicalsController.GetAllRestocks);

// Route to update a restock record
router.patch("/restock/:id", ChemicalsValidation.RestockChemical, Validation, ChemicalsController.UpdateRestockRecordById);

// Route to delete a restock record
router.delete("/restock/:id", ChemicalsValidation.Params_id, Validation, ChemicalsController.DeleteRestockRecordById);

// Route to get chemical by code or name
router.get('/get-chemical-by-code-or-name', ChemicalsController.GetChemicalByCodeOrName);




module.exports = router;
