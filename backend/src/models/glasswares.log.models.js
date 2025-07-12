const mongoose = require("mongoose");

const glasswareLogSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChemistryGlasswares", // Reference to the Glassware model
      required: true,
    },
    request_model: {
      type: String,
      required: true,
      trim: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
    },
    issued_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    returned_quantity: {
      type: Number,
      default: 0, // Default 0, updates when items are returned
      min: 0,
    },
    lost_or_damaged_quantity: {
      type: Number,
      default: 0, // If any glassware is lost/broken, record it
      min: 0,
    },
    date_issued: {
      type: Date,
      default: Date.now,
      required: true,
    },
    date_returned: {
      type: Date,
    },
    user_email: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const GlasswareLogModel = mongoose.model("ChemistryGlasswaresLogs", glasswareLogSchema);

module.exports = GlasswareLogModel;
