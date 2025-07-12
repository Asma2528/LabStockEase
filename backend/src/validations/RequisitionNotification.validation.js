const { body, param } = require("express-validator");

class RequisitionNotificationValidation {
  // Validation for creating a requisition notification
  static CreateRequisitionNotification = [
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
    body("requisitionId")
      .notEmpty()
      .withMessage("Requisition ID is required")
      .isMongoId()
      .withMessage("Provide a valid Requisition ID"),
    body("send_to")
      .isArray()
      .withMessage("Send_to must be an array")
      .notEmpty()
      .withMessage("Send_to cannot be empty"),
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .isIn([
        "requisition_created", 
        "requisition_rejected", 
        "requisition_update", 
        "requisition_delete", 
        "requisition_approved", 
        "requisition_issued",
        "requisition_return",
        "order_request_created",
        "order_request_update",
        "order_request_delete",
        "order_request_approved",
        "order_request_rejected",
        "order_request_ordered",
        "order_request_issued",
        "new_indent_created",
        "new_indent_update",
        "new_indent_delete",
        "new_indent_approved",
        "new_indent_rejected",
        "new_indent_ordered",
          "new_indent_issued"
      ])
      .withMessage(
        "Type must be one of: requisition_created, requisition_rejected, requisition_update, requisition_delete, requisition_approved, requisition_issued,  requisition_return, order_request_created, order_request_update,order_request_delete, order_request_approved, order_request_rejected, order_request_ordered, new_indent_created, new_indent_update, new_indent_delete, new_indent_approved, new_indent_rejected, new_indent_ordered"
      ),
  ];

  // Validation for deleting a requisition notification by ID
  static Params_id = [
    param("id").isMongoId().withMessage("Provide a valid Requisition Notification ID"),
  ];
}

module.exports = RequisitionNotificationValidation;
