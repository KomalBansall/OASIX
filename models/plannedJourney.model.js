const mongoose = require('mongoose');
const plannedjournyModel = mongoose.model(
    'plannedjourney', mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: "user"
        },
        friendId: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: "user"
        },
        locationName: {
            type: String
        },
        destinationName: {
            type:String
        },
        destinationCoordinates: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
            },        },
        day: {
            type: String
        },
        startDate: {
            type: Date,
            default: Date.now 
        },
        endDate: {
            type: Date
        },
        budget: {
            type: String
        },
        interestsId:[
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userinterests"    
        }],
        totalActivities:{
            type:Number
        },
        status:{
            type:Boolean,
            default:false
        }
    },
        { timestamps: true })

);
module.exports = plannedjournyModel;
