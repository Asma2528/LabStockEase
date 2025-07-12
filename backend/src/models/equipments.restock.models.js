const mongoose = require('mongoose');

const restockSchema = new mongoose.Schema({
    equipment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ChemistryEquipments', // Reference to the equipment model
        required: true 
    },
    inward: { type: mongoose.Schema.Types.ObjectId,   ref: 'Inward',required: true },  
    quantity_purchased: { 
        type: Number, 
        required: true 
    },  
    expiration_date: { 
        type: Date, 
    },
    expiration_alert_date: { 
        type: Date, 
        default: function() {
            const expirationDate = new Date(this.expiration_date);
            expirationDate.setDate(expirationDate.getDate() - 5); // Set alert 5 days before expiration
            return expirationDate;
        }
    },
    location: { 
        type: String 
    },  
    maintenance_date: { 
        type: Date
    },
    maintenance_details: { 
        type: String,
        trim: true
    },

}, {
    timestamps: true
});

const EquipmentsRestockModel = mongoose.model('ChemistryEquipmentsRestock', restockSchema);

module.exports = EquipmentsRestockModel;
