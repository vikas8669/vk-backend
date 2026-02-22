const mongoose = require("mongoose")

const contactUs = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },

    mobile:{
        type:Number,
        required:true,
    },

    email:{
        type:String,
        required:true,

    },
    description:{
        type:String,
        required:true
    },
    device: { type: String },
    browser: { type: String }

}, {timestamps:true})


module.exports = mongoose.model("contact", contactUs)