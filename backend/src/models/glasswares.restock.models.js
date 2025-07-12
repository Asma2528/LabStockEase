const mongoose = require("mongoose");

const glasswareRestockSchema = new mongoose.Schema({
    glassware: { type: mongoose.Schema.Types.ObjectId, ref: 'ChemistryGlasswares', required: true },
    inward: { type: mongoose.Schema.Types.ObjectId, ref: 'Inward', required: true },
    quantity_purchased: { type: Number, required: true },
    location: { type: String }
}, { timestamps: true });

const GlasswareRestockModel = mongoose.model("ChemistryGlasswaresRestock", glasswareRestockSchema);
module.exports = GlasswareRestockModel;
