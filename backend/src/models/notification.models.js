const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    send_to: { type: [String], required: true },
    type: { 
      type: String, 
      enum: ["createOrder", "createProject","createInvoice","approveInvoice","createInward","equipmentMaintenance" ], 
      required: true 
    },
    expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set expiration date 30 days from now
      index: { expires: 0 } // TTL index
    }
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notification", notificationSchema);

module.exports = NotificationModel;
