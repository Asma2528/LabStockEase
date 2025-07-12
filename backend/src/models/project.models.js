const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    projectCode: { type: String, required: true, unique: true },  // Unique Project Code
    description: { type: String}, 
    projectDate: { type: Date, required: true },  // Date of Project Creation
    sanctionDate: { type: Date, required: true },  // Date of Sanction Approval
    projectPeriod: { type: String, required: true },  // Duration of the Project
    fundingAgency: { type: String, required: true },  // Name of the Funding Agency
    projectCost: { type: Number, required: true },  // Total Project Cost
    fundStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Released', 'Completed'],
        required: true
    },  // Status of Funds
    projectInCharge: { type: String, required: true },  // Project In-Charge (User Reference)
    // List of orders linked to this project
    projectProcurements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],  
    projectStatus: {
        type: String,
        enum: ['Ongoing', 'Completed', 'On Hold', 'Cancelled'],
        required: true
    },  // Current Status of Project
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
