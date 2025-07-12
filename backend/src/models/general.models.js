const mongoose = require('mongoose');

const GeneralSchema = new mongoose.Schema({
    generalCode: { type: String, required: true, unique: true },
    description: { type: String },
    generalDate: { type: Date },
    sanctionDate: { type: Date },
    generalPeriod: { type: String },
    fundingAgency: { type: String },
    generalCost: { type: Number },
    fundStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Released', 'Completed'],
    },
    generalInCharge: { type: String },
    generalProcurements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    generalStatus: {
        type: String,
        enum: ['Ongoing', 'Completed', 'On Hold', 'Cancelled'],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
}, {
    timestamps: true,
    collection: 'generals'  // ✅ Explicitly define collection name
});

module.exports = mongoose.model('General', GeneralSchema);
