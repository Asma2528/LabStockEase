const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email ID is required"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true
    },
    roles: {
        type: [String], // Changed to an array of strings
        enum: ['admin', 'lab-assistant', 'faculty', 'stores', 'manager', 'accountant'],
        required: [true, "At least one role is required"],
        default: ['lab-assistant'] // Optional default role
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
