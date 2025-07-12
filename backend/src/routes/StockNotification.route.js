const express = require("express");
const Authentication = require("../middlewares/Authentication");
const StockNotificationController = require("../controllers/StockNotificationController");
const StockNotificationValidation = require("../validations/StockNotification.validation");
const Validation = require("../middlewares/Validation");

const router = express.Router();

// Apply authentication middleware
router.use(Authentication);

// Route to create a stock notification
router.post(
  "/create",
  StockNotificationValidation.CreateStockNotification,
  Validation, // Middleware to handle validation errors
  StockNotificationController.createNotification
);

// Route to get all stock notifications
router.get("/get-all", StockNotificationController.getAllNotifications);

// Route to delete a stock notification by ID
router.delete(
  "/delete/:id",
  StockNotificationValidation.Params_id,
  Validation,
  StockNotificationController.deleteNotification
);

// Route to delete multiple stock notifications
router.post(
  "/delete-many",
  Validation, // Add request body validations here if necessary
  StockNotificationController.deleteMany
);

module.exports = router;
