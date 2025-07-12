const { body, param } = require("express-validator");

class InvoiceValidation {

  // Validation for creating an invoice
  static CreateInvoice = [
    body("order")
      .notEmpty().withMessage("Order ID is required")
      .isMongoId().withMessage("Provide a valid Order ID"),
    
    body("billNo")
      .notEmpty().withMessage("Bill number is required")
      .isInt().withMessage("Bill number must be an integer",

    body("billDate")
      .notEmpty().withMessage("Bill date is required")
      .isISO8601().withMessage("Bill date must be a valid date"),

    body("invoiceAmount")
      .notEmpty().withMessage("Invoice amount is required")
      .isFloat({ min: 0 }).withMessage("Invoice amount must be a positive number"),

    body("invoiceStatus")
      .optional()
      .isIn(["Pending", "Approved", "Rejected", "On hold"]).withMessage("Invalid invoice status"),

    body("comment")
      .optional()
      .isString().withMessage("Comment must be a string")
      .trim()
      )
  ];

  // Validation for updating an invoice
  static UpdateInvoice = [
    param("id")
      .isMongoId().withMessage("Provide a valid Invoice ID"),

      body("order")
      .notEmpty().withMessage("Order ID is required")
      .isMongoId().withMessage("Provide a valid Order ID"),
    
    body("billNo")
      .notEmpty().withMessage("Bill number is required")
      .isInt().withMessage("Bill number must be an integer",

    body("billDate")
      .notEmpty().withMessage("Bill date is required")
      .isISO8601().withMessage("Bill date must be a valid date"),

    body("invoiceAmount")
      .notEmpty().withMessage("Invoice amount is required")
      .isFloat({ min: 0 }).withMessage("Invoice amount must be a positive number"),

    body("status")
      .optional()
      .isIn(["Pending", "Approved", "Rejected", "On hold"]).withMessage("Invalid invoice status"),

    body("comment")
      .optional()
      .isString().withMessage("Comment must be a string")
      .trim()
      )
  ];

  // Validation for approving an invoice
  static ApproveInvoice = [
    param("id")
      .isMongoId().withMessage("Provide a valid Invoice ID"),

    body("status")
      .notEmpty().withMessage("Provide invoice status")
      .isIn(["Approved", "Rejected","On hold"]).withMessage("Invalid invoice status"),
      
       body("remark")
    .optional()
    .isString().withMessage("Remark must be a string if provided")
    .trim(),

  ];



  // Validation for validating an ID in params
  static Params_id = [
    param("id")
      .isMongoId().withMessage("Provide a valid Invoice ID")
  ];
}

module.exports = InvoiceValidation;
