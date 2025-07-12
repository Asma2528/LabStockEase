const mongoose = require("mongoose");

const sequenceSchema = new mongoose.Schema({
    prefix: { type: String, required: true, unique: true },
    counter: { type: Number, default: 0 }
});

module.exports = mongoose.model("Sequence", sequenceSchema);
