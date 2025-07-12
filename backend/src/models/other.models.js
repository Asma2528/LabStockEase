const mongoose = require('mongoose');

const OtherSchema = new mongoose.Schema({
    otherCode: { type: String, required: true, unique: true },  // Unique other Code
    description: { type: String}, 
    otherDate: { type: Date },  // Date of other Creation
    sanctionDate: { type: Date },  // Date of Sanction Approval
    otherPeriod: { type: String },  // Duration of the other
    fundingAgency: { type: String },  // Name of the Funding Agency
    otherCost: { type: Number},  // Total other Cost
    fundStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Released', 'Completed'],
    },  // Status of Funds
    otherInCharge: { type: String},  // other In-Charge (User Reference)
    // List of orders linked to this other
    otherProcurements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],  
    otherStatus: {
        type: String,
        enum: ['Ongoing', 'Completed', 'On Hold', 'Cancelled'],
    },  // Current Status of other
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Other', OtherSchema);
