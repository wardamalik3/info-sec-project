const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    filename: {
        type:String,
        required:true
    },
    originalName: {
        type:String,
        required:true
    },
    sender: {
        type:String,
        required:true
    },
    recipient: {
        type:String,
        required:true
    },
    iv: {
        type:String, // Hex string of IV
        required:true
    },
    path: {
        type:String,
        required:true
    },
    size: {
        type:Number,
        required:true
    },
    createdAt: {
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('File', FileSchema);
