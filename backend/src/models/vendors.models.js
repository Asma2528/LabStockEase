const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    contact_person: {
        type: String,
        required: true
    },
    contact_no: {
        type: String,
        required: true
    },
    classification: {
        type: String,
        enum: ['Capital', 'Consumables', 'Chemical', 'Glassware', 'Books', 'Others'],
        required: true
    },
    tan_pan_no: {
        type: String,
        required: true
    },
    gst_no: {
        type: String,
        required: true
    },
    grading: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
