  const mongoose = require("mongoose");

  const requisitionNotificationSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      message: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      requisitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Requisition", required: true },
      send_to: { 
        type: [String], 
        required: true 
      },
      type: { 
        type: String, 
        enum: [
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
        ], 
        required: true 
      },
      expiresAt: { type: Date }, // This field will be used for TTL
    },
    { timestamps: true }
  );

  // Optional unique constraint to prevent duplicates
  requisitionNotificationSchema.index({ userId: 1, requisitionId: 1, type: 1 }, { unique: true });

  // Create a TTL index for `expiresAt` field
  requisitionNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  const RequisitionNotificationModel = mongoose.model('RequisitionNotification', requisitionNotificationSchema);

  module.exports = RequisitionNotificationModel;