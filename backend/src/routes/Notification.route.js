const express = require("express");
const Authentication = require("../middlewares/Authentication");
const NotificationController = require("../controllers/NotificationController");
const NotificationValidation = require("../validations/Notification.validation");
const Validation = require("../middlewares/Validation");

const router = express.Router();

// Apply authentication middleware
router.use(Authentication);

// Route to create a   notificatsion
router.post(
  "/create",
  NotificationValidation.CreateNotification,
  Validation, // Middleware to handle validation errors
  NotificationController.createNotification
);

// Route to get all   notifications
router.get("/get-all", NotificationController.getAllNotifications);

// Route to delete a   notification by ID
router.delete(
  "/delete/:id",
   NotificationValidation.Params_id,
  Validation,
 NotificationController.deleteNotification
);

// Route to delete multiple   notifications
router.post(
  "/delete-many",
  Validation, // Add request body validations here if necessary
  NotificationController.deleteMany
);

module.exports = router;
