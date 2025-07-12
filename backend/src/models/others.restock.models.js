const mongoose = require('mongoose');

const restockSchema = new mongoose.Schema({
    other: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ChemistryOthers', // Reference to the other model
        required: true 
    },
    inward: { type: mongoose.Schema.Types.ObjectId,   ref: 'Inward',required: true },  
    quantity_purchased: { 
        type: Number, 
        required: true 
    },  
    expiration_date: { 
        type: Date, 
        default: null // Default to null if not provided
    },
    
    expiration_alert_date: { 
        type: Date, 
        default: function() {
            if (!this.expiration_date) return null; // Keep it null if expiration_date is not set
            const expirationDate = new Date(this.expiration_date);
            expirationDate.setDate(expirationDate.getDate() - 5); // Alert 5 days before expiration
            return expirationDate;
        }
    },
    
    location: { 
        type: String 
    },  

}, {
    timestamps: true
});

const OthersRestockModel = mongoose.model('ChemistryOthersRestock', restockSchema);

module.exports = OthersRestockModel;
