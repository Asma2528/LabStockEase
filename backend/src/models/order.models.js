const mongoose = require('mongoose');
const Sequence = require('./Sequence');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  poNumber: { type: String, required: true, unique: true },
  categoryType: {
    type: String,
    enum: ['General', 'Project', 'Practical', 'Other'],
    required: true
  },
  category: { type: mongoose.Schema.Types.ObjectId, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  quotationRefNo: { type: String, required: true },
  quotationDate: { type: Date, required: true },
  items: [
    {
      entryNo: { type: Number, required: true },
      description: { type: String, required: true },
      class: {
        type: String,
        enum: ['Chemicals', 'Books', 'Glasswares', 'Consumables', 'Equipments', 'Others'],
        required: true
      },
      item: { type: mongoose.Schema.Types.ObjectId, required: true },
      casNo: { type: String },
      make: { type: String },
      quantity: { type: Number, required: true },
      rate: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      taxGST: { type: Number, default: 0 },
      cost: { type: Number, required: true }
    }
  ],
  totalCost: { type: Number, required: true },
  totalGST: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  notes: { type: String, maxlength: 100 },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Received', 'Placed'],
    default: 'Pending'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  remark: { type: String }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// ✅ Virtual field (not stored in DB)
OrderSchema.virtual('orderNumberKeyVirtual')
  .get(function () {
    return this._orderNumberKey;
  })
  .set(function (val) {
    this._orderNumberKey = val;
  });

// ✅ Pre-save hook to generate order number using virtual
OrderSchema.pre('save', async function (next) {
  try {
    if (!this.orderNumber) {
      const year = new Date().getFullYear();
      const nextYear = year + 1;
      const financialYear = `${year}-${nextYear.toString().slice(-2)}`;

      const prefix = `JAI-${this.categoryType.toUpperCase().slice(0, 4)}`;
      const orderNumberKey = this._orderNumberKey;
      console.log('Received orderNumberKey in pre-save:', orderNumberKey);

      const sequencePrefix = orderNumberKey ? `${prefix}/${orderNumberKey}` : prefix;

      const sequence = await Sequence.findOneAndUpdate(
        { prefix: sequencePrefix },
        { $inc: { counter: 1 } },
        { new: true, upsert: true }
      );

      const orderCount = String(sequence.counter).padStart(3, '0');

      this.orderNumber = orderNumberKey
        ? `${prefix}/${orderNumberKey}/${orderCount}/${financialYear}`
        : `${prefix}/${orderCount}/${financialYear}`;
    }

    next();
  } catch (error) {
    console.error('Error generating order number:', error);
    next(error);
  }
});

module.exports = mongoose.model('Order', OrderSchema);
