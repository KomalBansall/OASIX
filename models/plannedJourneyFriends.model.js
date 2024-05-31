const mongoose = require('mongoose');
const plannedJourneyFriendModel = mongoose.model(
    'plannedjourneyfriend', mongoose.Schema({
        friendId: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref:"user"
        },
        plannedId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:"plannedjourney"
        },
        // status:{
        //     type:Boolean,
        //     default:false
        // }
    },
        { timestamps: true })

);
module.exports = plannedJourneyFriendModel;
