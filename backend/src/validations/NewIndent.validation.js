const { body, param } = require("express-validator");

class NewIndentValidation {
  // Validation for creating a requisition

static CreateNewIndent = [
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
  body("items.*.description")
    .isString().withMessage("Description must be a string"),
    body("items.*.technical_details")
    .isString().withMessage("Technical Details must be a string"),
  body("status")
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected', 'Ordered','Issued'])
    .withMessage("Invalid status"),
  body("remark")
    .optional()
    .isString().withMessage("Remark must be a string")
    .trim(),
  // Validation for date_of_requirement
  body("date_of_requirement")
    .notEmpty().withMessage("Date of requirement is required")
    .isISO8601().withMessage("Date of requirement must be a valid date"),
        body('categoryType')
          .notEmpty().withMessage('Category Type is required')
          .isString().withMessage('Category Type must be a string'),
  
          body('category')
              .notEmpty().withMessage('Category is required')
              .isMongoId().withMessage('Invalid Category ID'),

];

// Validation for updating a requisition
static UpdateNewIndent = [
  param("id")
    .isMongoId().withMessage("Provide a valid New Indent ID"),
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
  body("items.*.description")
    .optional()
    .isString().withMessage("Description must be a string if provided"),
    body("items.*.technical_details")
    .optional()
    .isString().withMessage("Technical Details must be a string if provided"),
  body("status")
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected', 'Ordered','Issued'])
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


static ApproveNewIndent = [
  param("id")
    .isMongoId().withMessage("Provide a valid Order Request ID"),
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

static ChangeStatusToOrdered = [
  param("id")
    .isMongoId().withMessage("Provide a valid Order Request ID"),
    body("status")
    .notEmpty().withMessage("Provide status")
    .isIn(['Ordered']).withMessage("Invalid status if provided")
  ]


// Validation for validating an ID in params
static Params_id = [
  param("id").isMongoId().withMessage("Provide a valid Order Request ID")
];
}

module.exports = NewIndentValidation;
