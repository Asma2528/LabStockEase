const mongoose = require("mongoose");

const othersLogSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChemistryOthers',  // Reference to the Other model
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

const OthersLogModel = mongoose.model("ChemistryOthersLogs", othersLogSchema);

module.exports = OthersLogModel;
