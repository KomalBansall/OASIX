const mongoose = require('mongoose');
const chatModel = mongoose.model(
    'chat', mongoose.Schema({
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        recieverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        message:{
            type:Boolean
        }
    },
        { timestamps: true })

);
module.exports = chatModel;
