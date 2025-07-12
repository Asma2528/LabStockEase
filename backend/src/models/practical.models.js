const mongoose = require('mongoose');

const PracticalSchema = new mongoose.Schema({
    practicalCode: { type: String, required: true, unique: true },  // Unique practical Code
    description: { type: String}, 
    practicalDate: { type: Date },  // Date of practical Creation
    sanctionDate: { type: Date },  // Date of Sanction Approval
    practicalPeriod: { type: String },  // Duration of the practical
    fundingAgency: { type: String },  // Name of the Funding Agency
    practicalCost: { type: Number},  // Total practical Cost
    fundStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Released', 'Completed'],
    },  // Status of Funds
    practicalInCharge: { type: String},  // practical In-Charge (User Reference)
    // List of orders linked to this practical
    practicalProcurements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],  
    practicalStatus: {
        type: String,
        enum: ['Ongoing', 'Completed', 'On Hold', 'Cancelled'],
    },  // Current Status of practical
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Practical', PracticalSchema);
