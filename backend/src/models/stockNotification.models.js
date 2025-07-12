const mongoose = require("mongoose");

const stockNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    send_to: { 
      type: [String], 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["low_stock", "out_of_stock", "near_expiry", "expired","stock_recovered"], 
      required: true 
    },
    expiresAt: { type: Date },  
  },
  { timestamps: true }
);


stockNotificationSchema.index({ itemId: 1, type: 1 }, { unique: true });


const StockNotificationModel = mongoose.model('StockNotification', stockNotificationSchema);

module.exports = StockNotificationModel;

