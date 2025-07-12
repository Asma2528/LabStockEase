// This file is used for refresh token
// For eg: if a user is logged in in a website. After few days they need to relogin

const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    refresh_token:{
        type:String,
        default:''
    }
},{timestamps:true})

// Any middleware will come between the schema and the model 

const model = mongoose.model("profile",Schema);
module.exports = model;
