const express = require("express");
const Authentication = require("../middlewares/Authentication");
const RequisitionNotificationController = require("../controllers/RequisitionNotificationController");
const RequisitionNotificationValidation = require("../validations/RequisitionNotification.validation");
const Validation = require("../middlewares/Validation");

const router = express.Router();

// Apply authentication middleware
router.use(Authentication);

// Route to create a requisition notificatsion
router.post(
  "/create",
  RequisitionNotificationValidation.CreateRequisitionNotification,
  Validation, // Middleware to handle validation errors
  RequisitionNotificationController.createNotification
);

// Route to get all requisition notifications
router.get("/get-all", RequisitionNotificationController.getAllNotifications);

// Route to delete a requisition notification by ID
router.delete(
  "/delete/:id",
  RequisitionNotificationValidation.Params_id,
  Validation,
  RequisitionNotificationController.deleteNotification
);

// Route to delete multiple requisition notifications
router.post(
  "/delete-many",
  Validation, // Add request body validations here if necessary
  RequisitionNotificationController.deleteMany
);

module.exports = router;
