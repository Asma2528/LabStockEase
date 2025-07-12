const mongoose = require("mongoose");

const consumablesLogSchema = new mongoose.Schema(
  {
    
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChemistryConsumables',  // Reference to the Consumable model
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
    date_issued: {
        type: Date,
        default: Date.now,
        required: true,
      },
    user_email: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

const ConsumablesLogModel = mongoose.model("ChemistryConsumablesLogs", consumablesLogSchema);

module.exports = ConsumablesLogModel;
