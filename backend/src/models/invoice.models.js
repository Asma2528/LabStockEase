const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    billNo: {
      type: Number,
      required: true,
      unique: true,
    },
    billDate: { type: Date, required: true },
    invoiceAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "On hold"],
      default: "Pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    approved_at: { type: Date },
    comment: { type: String },
  remark: { type: String }
  },
  { timestamps: true }
);

const InvoiceModel = mongoose.model("Invoice", InvoiceSchema);

module.exports = InvoiceModel;


