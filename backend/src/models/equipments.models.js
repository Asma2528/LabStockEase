const mongoose = require("mongoose");

const equipmentsSchema = new mongoose.Schema({
    item_code: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    item_name: {
        type: String,
        required: true,
        trim: true
    },
    manual: {
        type: String,
        trim: true,
        required:true
    },
    model_number: {
        type: String,
        trim: true
    },
    serial_number: {
        type: String,
        trim: true,
        unique: true,
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    purpose: {
        type: String,
        trim: true
    },
    total_quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    current_quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    min_stock_level: {
        type: Number,
        required: true,
        min: 0
    },
    unit_of_measure: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['In Stock', 'Out of Stock','Low Stock'],
        default: 'In Stock'
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const EquipmentsModel = mongoose.model("ChemistryEquipments", equipmentsSchema);

module.exports = EquipmentsModel;
