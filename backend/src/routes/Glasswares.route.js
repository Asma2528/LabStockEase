const express = require("express");
const Authentication = require("../middlewares/Authentication");
const GlasswaresController = require("../controllers/GlasswaresController");
const GlasswaresValidation = require("../validations/Glasswares.validation");
const Validation = require("../middlewares/Validation");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(Authentication);

// Route to get all Glasswares items without pagination
router.get("/get-all", GlasswaresController.GetAllItems);

// Route to register a new Glasswares item
router.post("/register", GlasswaresValidation.RegisterGlasswares, Validation, GlasswaresController.RegisterGlasswaresItem);

// Route to get a Glasswares item by its ID
router.get("/get/:id", GlasswaresValidation.Params_id, Validation, GlasswaresController.getById);

router.get("/get-item-codes/:id", GlasswaresValidation.Params_id, Validation, GlasswaresController.getItemCodesByClass);

// Route to update a Glasswares item by its ID
router.patch("/update/:id", GlasswaresValidation.RegisterGlasswares, Validation, GlasswaresController.updateById);

router.patch("/return-log/:id",  Validation, GlasswaresController.returnLogById);

// Route to delete a Glasswares item by its ID
router.delete("/delete/:id", GlasswaresValidation.Params_id, Validation, GlasswaresController.DeleteGlasswaresItem);


// Route to register a log for issued glasswares
router.post(
  "/register-log",
  GlasswaresValidation.LogIssuedQuantity,  // Validation for logging quantity
  Validation,  // General validation middleware
  GlasswaresController.LogIssuedQuantity  // Controller to handle logging
);

// Route to get all logs
router.get("/get-all-logs", GlasswaresController.GetLogs);


// Route to update a log
router.patch("/update-log/:id",  GlasswaresValidation.LogUpdateIssuedQuantity, Validation, GlasswaresController.updateLogById);

// Route to delete a log
router.delete("/delete-log/:id", GlasswaresValidation.Params_id, Validation, GlasswaresController.DeleteGlasswaresLogItem);

// Restock a glassware item
router.post("/restock", GlasswaresValidation.RestockGlasswares, Validation, GlasswaresController.RestockGlassware);

// Route to get all restock records
router.get('/restock/get-all', GlasswaresController.GetAllRestocks);

// Route to update a restock record
router.patch("/restock/:id",Validation, GlasswaresController.UpdateRestockRecordById);

// Route to delete a restock record
router.delete("/restock/:id", GlasswaresValidation.Params_id, Validation, GlasswaresController.DeleteRestockRecordById);

// Route to get glassware by code or name
router.get('/get-glassware-by-code-or-name', GlasswaresController.GetGlasswareByCodeOrName);




module.exports = router;
