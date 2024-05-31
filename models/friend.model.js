const mongoose = require('mongoose');
const friendModel = mongoose.model(
    'friend', mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        friendId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        status:{
            type:Boolean
        }
    },
        { timestamps: true })

);
module.exports = friendModel;
