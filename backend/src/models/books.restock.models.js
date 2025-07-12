const mongoose = require('mongoose');

const restockSchema = new mongoose.Schema({
    book: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ChemistryBooks', // Reference to the book model
        required: true 
    },
    inward: { type: mongoose.Schema.Types.ObjectId,   ref: 'Inward',required: true },  
    quantity_purchased: { 
        type: Number, 
        required: true 
    },  

}, {
    timestamps: true
});

const BooksRestockModel = mongoose.model('ChemistryBooksRestock', restockSchema);

module.exports = BooksRestockModel;
