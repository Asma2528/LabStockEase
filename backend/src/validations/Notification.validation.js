const { body, param } = require("express-validator");

class NotificationValidation {
  // Validation for creating a   notification
  static CreateNotification = [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string"),
    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isString()
      .withMessage("Message must be a string"),
    body("send_to")
      .isArray()
      .withMessage("Send_to must be an array")
      .notEmpty()
      .withMessage("Send_to cannot be empty"),
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .isIn([
       "createOrder", "createProject","createInvoice","approveInvoice","createInward"
      ])
      .withMessage(
        "Type must be one of: createOrde, createProject, createInvoice, approveInvoice, createInward"
      ),
  ];

  // Validation for deleting a   notification by ID
  static Params_id = [
    param("id").isMongoId().withMessage("Provide a valid  Notification ID"),
  ];
}

module.exports =  NotificationValidation;
