const express = require("express");
const Authentication = require("../middlewares/Authentication");
const BooksController = require("../controllers/BooksController");
const BooksValidation = require("../validations/Books.validation");
const Validation = require("../middlewares/Validation");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(Authentication);

// Route to get all Books items without pagination
router.get("/get-all", BooksController.GetAllItems);

// Route to register a new Books item
router.post("/register", BooksValidation.RegisterBooks, Validation, BooksController.RegisterBooksItem);

// Route to get a Books item by its ID
router.get("/get/:id", BooksValidation.Params_id, Validation, BooksController.getById);

router.get("/get-item-codes/:id", BooksValidation.Params_id, Validation, BooksController.getItemCodesByClass);

// Route to update a Books item by its ID
router.patch("/update/:id", BooksValidation.RegisterBooks, Validation, BooksController.updateById);

// Route to delete a Books item by its ID
router.delete("/delete/:id", BooksValidation.Params_id, Validation, BooksController.DeleteBooksItem);


// Route to register a log for issued books
router.post(
  "/register-log",
  BooksValidation.LogIssuedQuantity,  // Validation for logging quantity
  Validation,  // General validation middleware
  BooksController.LogIssuedQuantity  // Controller to handle logging
);

// Route to get all logs
router.get("/get-all-logs", BooksController.GetLogs);


// Route to update a log
router.patch("/update-log/:id",  BooksValidation.LogUpdateIssuedQuantity, Validation, BooksController.updateLogById);

// Route to delete a log
router.delete("/delete-log/:id", BooksValidation.Params_id, Validation, BooksController.DeleteBooksLogItem);

// Restock a book item
router.post("/restock", BooksValidation.RestockBook, Validation, BooksController.RestockBook);

// Route to get all restock records
router.get('/restock/get-all', BooksController.GetAllRestocks);

// Route to update a restock record
router.patch("/restock/:id", BooksValidation.RestockBook, Validation, BooksController.UpdateRestockRecordById);

// Route to delete a restock record
router.delete("/restock/:id", BooksValidation.Params_id, Validation, BooksController.DeleteRestockRecordById);

// Route to get book by code or name
router.get('/get-book-by-code-or-name', BooksController.GetBookByCodeOrName);




module.exports = router;
