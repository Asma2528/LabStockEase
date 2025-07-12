const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    item_code: { type: String, unique: true, required: true, trim: true },
    item_name: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    publisher: { type: String, required: true, trim: true },
    edition: { type: String, trim: true },
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
    location: { type: String, required: true },
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
}, { timestamps: true });

const BookModel = mongoose.model("ChemistryBooks", bookSchema);
module.exports = BookModel;
