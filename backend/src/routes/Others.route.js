const express = require("express");
const Authentication = require("../middlewares/Authentication");
const OthersController = require("../controllers/OthersController");
const OthersValidation = require("../validations/Others.validation");
const Validation = require("../middlewares/Validation");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(Authentication);

// Route to get all Others items without pagination
router.get("/get-all", OthersController.GetAllItems);

// Route to register a new Others item
router.post("/register", OthersValidation.RegisterOthers, Validation, OthersController.RegisterOthersItem);

// Route to get a Others item by its ID
router.get("/get/:id", OthersValidation.Params_id, Validation, OthersController.getById);

router.get("/get-item-codes/:id", OthersValidation.Params_id, Validation, OthersController.getItemCodesByClass);

// Route to update a Others item by its ID
router.patch("/update/:id", OthersValidation.RegisterOthers, Validation, OthersController.updateById);

// Route to delete a Others item by its ID
router.delete("/delete/:id", OthersValidation.Params_id, Validation, OthersController.DeleteOthersItem);


// Route to register a log for issued others
router.post(
  "/register-log",
  OthersValidation.LogIssuedQuantity,  // Validation for logging quantity
  Validation,  // General validation middleware
  OthersController.LogIssuedQuantity  // Controller to handle logging
);

// Route to get all logs
router.get("/get-all-logs", OthersController.GetLogs);


// Route to delete a log
router.delete("/delete-log/:id", OthersValidation.Params_id, Validation, OthersController.DeleteOthersLogItem);

// Restock a other item
router.post("/restock", OthersValidation.RestockOthers, Validation, OthersController.RestockOthers);

// Route to get all restock records
router.get('/restock/get-all', OthersController.GetAllRestocks);

// Route to update a restock record
router.patch("/restock/:id", OthersValidation.RestockOthers, Validation, OthersController.UpdateRestockRecordById);
router.patch("/update-log/:id",  OthersValidation.LogUpdateIssuedQuantity, Validation, OthersController.UpdateOtherLogItemById );


// Route to delete a restock record
router.delete("/restock/:id", OthersValidation.Params_id, Validation, OthersController.DeleteRestockRecordById);

// Route to get other by code or name
router.get('/get-other-by-code-or-name', OthersController.GetOthersByCodeOrName);




module.exports = router;
