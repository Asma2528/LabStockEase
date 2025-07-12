const { body, param } = require("express-validator");

class StockNotificationValidation {
  // Validation for creating a stock notification
  static CreateStockNotification = [
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
    body("userId")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Provide a valid User ID"),
    body("itemId")
      .notEmpty()
      .withMessage("Item ID is required")
      .isMongoId()
      .withMessage("Provide a valid Item ID"),
    body("send_to")
      .isArray()
      .withMessage("Send_to must be an array")
      .notEmpty()
      .withMessage("Send_to cannot be empty"),
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .isIn(["low_stock", "out_of_stock", "near_expiry", "expired"])
      .withMessage("Type must be one of: low_stock, out_of_stock, near_expiry, expired"),
  ];

  // Validation for deleting a stock notification by ID
  static Params_id = [
    param("id").isMongoId().withMessage("Provide a valid Stock Notification ID"),
  ];
}

module.exports = StockNotificationValidation;
