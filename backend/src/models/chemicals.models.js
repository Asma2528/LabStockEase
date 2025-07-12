const mongoose = require("mongoose");

const chemicalsSchema = new mongoose.Schema({
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
    casNo: {
        type: String,
        trim: true,
        required:true
    },
    msds: {
        type: String,
        trim: true,
        required:true
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
        enum: ['Out of Stock', 'Low Stock', 'In Stock'],
        default: function () {
            return this.current_quantity > this.min_stock_level ? 'In Stock' : 'Out of Stock';
        },
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const ChemicalsModel = mongoose.model("ChemistryChemicals", chemicalsSchema);

module.exports = ChemicalsModel;
