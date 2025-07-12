const mongoose = require("mongoose");

const equipmentsLogSchema = new mongoose.Schema(
  {
    
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChemistryEquipments',  // Reference to the Equipment model
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
      default: 0, // If equipment is lost/damaged, record it
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
    }
  },
  {
    timestamps: true,
  }
);

const EquipmentsLogModel = mongoose.model("ChemistryEquipmentsLogs", equipmentsLogSchema);

module.exports = EquipmentsLogModel;
