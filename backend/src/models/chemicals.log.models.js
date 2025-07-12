const mongoose = require("mongoose");

const chemicalsLogSchema = new mongoose.Schema(
  {
    
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChemistryChemicals',  // Reference to the Chemical model
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

const ChemicalsLogModel = mongoose.model("ChemistryChemicalsLogs", chemicalsLogSchema);

module.exports = ChemicalsLogModel;
