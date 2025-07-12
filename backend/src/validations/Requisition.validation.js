const { body, param } = require("express-validator");

class RequisitionValidation {
  // Validation for creating a requisition

static CreateRequisition = [
    body('categoryType')
          .notEmpty().withMessage('Category Type is required')
          .isString().withMessage('Category Type must be a string'),
  
          body('category')
              .notEmpty().withMessage('Category is required')
              .isMongoId().withMessage('Invalid Category ID'),
  body("items")
    .isArray().withMessage("Items must be an array")
    .notEmpty().withMessage("Items array cannot be empty"),
  body("items.*.class")
    .notEmpty().withMessage("Class is required")
    .isString().withMessage("Class must be a string"),
  body("items.*.unit_of_measure")
    .notEmpty().withMessage("Unit of measure is required")
    .isString().withMessage("Unit of measure must be a string"),
  body("items.*.quantity_required")
    .notEmpty().withMessage("Quantity required is required")
    .isNumeric().withMessage("Quantity required must be a number"),
  body("items.*.quantity_returned")
    .optional()
    .isNumeric().withMessage("Quantity returned must be a number if provided"),
  body("items.*.description")
    .notEmpty().withMessage("Description is required")
    .isString().withMessage("Description must be a string"),

  body("status")
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected', 'Issued', 'Return'])
    .withMessage("Invalid status"),
  body("remark")
    .optional()
    .isString().withMessage("Remark must be a string")
    .trim(),
  // Validation for date_of_requirement
  body("date_of_requirement")
    .notEmpty().withMessage("Date of requirement is required")
    .isISO8601().withMessage("Date of requirement must be a valid date"),
];

// Validation for updating a requisition
static UpdateRequisition = [
  param("id")
    .isMongoId().withMessage("Provide a valid Requisition ID"),
  body("items")
    .optional()
    .isArray().withMessage("Items must be an array if provided"),
  body("items.*.class")
    .optional()
    .isString().withMessage("Class must be a string if provided"),
  body("items.*.item")
    .optional(),
  body("items.*.unit_of_measure")
    .optional()
    .isString().withMessage("Unit of measure must be a string if provided"),
  body("items.*.quantity_required")
    .optional()
    .isNumeric().withMessage("Quantity required must be a number if provided"),
  body("items.*.quantity_returned")
    .optional()
    .isNumeric().withMessage("Quantity returned must be a number if provided"),
  body("items.*.description")
    .optional()
    .isString().withMessage("Description must be a string if provided"),
  body("status")
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected', 'Issued', 'Return'])
    .withMessage("Invalid status if provided"),
  body("remark")
    .optional()
    .isString().withMessage("Remark must be a string if provided")
    .trim(),
  // Validation for date_of_requirement
  body("date_of_requirement")
  .optional()
    .isISO8601().withMessage("Date of requirement must be a valid date if provided"),
];


static ApproveRequisition = [
  param("id")
    .isMongoId().withMessage("Provide a valid Requisition ID"),
    body("status")
    .notEmpty().withMessage("Provide status")
    .isIn(['Approved', 'Rejected']).withMessage("Invalid status if provided"),
  
    body("items.*.remark")
    .optional()
    .isString().withMessage("Remark must be a string if provided"),
  body("remark")
    .optional()
    .isString().withMessage("Remark must be a string if provided")
    .trim(),

];

static ChangeStatusToIssued = [
  param("id")
    .isMongoId().withMessage("Provide a valid Requisition ID"),
    body("status")
    .notEmpty().withMessage("Provide status")
    .isIn(['Issued']).withMessage("Invalid status if provided"),
      body("items.*.quantity_issued")
    .notEmpty().withMessage("Quantity issued is required")
    .isNumeric().withMessage("Quantity issued must be a number")
  
  ]

  static ReturnRequisition = [
    param("id")
      .isMongoId().withMessage("Provide a valid Requisition ID"),
      body("status")
      .notEmpty().withMessage("Provide status")
      .isIn(['Return']).withMessage("Invalid status if provided"),
      body("items.*.quantity_returned")
      .optional()
      .isNumeric().withMessage("Quantity returned must be a number if provided")
  
  ];

// Validation for validating an ID in params
static Params_id = [
  param("id").isMongoId().withMessage("Provide a valid Requisition ID")
];
}

module.exports = RequisitionValidation;
