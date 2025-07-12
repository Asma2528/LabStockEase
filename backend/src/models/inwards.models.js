const mongoose = require('mongoose');

const InwardSchema = new mongoose.Schema({
    inward_code: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
            class: { 
                type: String, 
                enum: ['Chemicals', 'Books', 'Glasswares', 'Consumables', 'Equipments', 'Others'],
                required: true 
            },  
            item: { type: mongoose.Schema.Types.ObjectId, required: true },  
            description: { type: String, required: true },
            grade: { 
                type: String, 
                enum: ["AR", "LR", "GR", "COM", "HPLC"], 
            },
            // Description
            casNo: { type: String }, // CAS No
            quantity: { type: Number, required: true }, // Qty
            unit: { 
                type: String, 
                enum: ["Nos", "ml", "L", "kg", "g", "Box"], 
                required: true 
            }, // Units with predefined values
            thClass: { 
                type: String,
                enum: [
                    "E - Explosive",
                    "O - Oxidizing",
                    "F - Flammable",
                    "F+ - Extremely Flammable",
                    "T - Toxic",
                    "T+ - Very Toxic",
                    "Xn - Harmful",
                    "Xi - Irritant",
                    "C - Carcinogen",
                    "Ter - Teratogen",
                    "Mut - Mutagen"
                ] 
            },
            // TH Class
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
            invoice: {type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
}, { timestamps: true });

const InwardsModel = mongoose.model("Inward", InwardSchema);

module.exports = InwardsModel;
