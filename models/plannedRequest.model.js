const mongoose = require('mongoose');
const plannedRequestModel = mongoose.model(
    'plannedrequest', mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:"user"
        },
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref:"user"
        },
        plannedId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:"plannedjourney"
        },
        status:{
            type:Boolean,
            default:false
        }
    },
        { timestamps: true })

);
module.exports = plannedRequestModel;
