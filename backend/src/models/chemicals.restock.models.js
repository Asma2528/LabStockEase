const mongoose = require('mongoose');

const restockSchema = new mongoose.Schema({
    chemical: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChemistryChemicals', // Reference to the chemical model
        required: true
    },
    inward: { type: mongoose.Schema.Types.ObjectId, ref: 'Inward', required: true },
    quantity_purchased: {
        type: Number,
        required: true
    },
    expiration_date: {
        type: Date,
        required: true
    },
    expiration_alert_date: {
        type: Date,
        required: true,
        default: function () {
            const expirationDate = new Date(this.expiration_date);
            expirationDate.setDate(expirationDate.getDate() - 5); // Set alert 5 days before expiration
            return expirationDate;
        }
    },
    location: {
        type: String
    },

}, {
    timestamps: true
});

const ChemicalsRestockModel = mongoose.model('ChemistryChemicalsRestock', restockSchema);

module.exports = ChemicalsRestockModel;
