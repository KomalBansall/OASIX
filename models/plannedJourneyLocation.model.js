const mongoose = require('mongoose');
const plannedjournylocationModel = mongoose.model(
    'plannedjourneylocation', mongoose.Schema({
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        plannedJouranyId: {
            type: mongoose.Schema.Types.ObjectId,
             ref: "plannedjourney"
        },
        destinationName: {
            type: String
        },
        destinationCoordinates:{
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
            },
        },
        image: {
            type: String
        },
        distance:{
            type:String
        },
        averageRating:{
            type:String
        },
        phoneNumber:{
            type:String
        },
        description:{
            type:String
        },
        website:{
            type:String
        },
        averageCostperPerson:{
            type:String
        },
        review:{
            type:String
        },
        todayEvents:{
            type:String
        },
        status:{
            type:Boolean,
            default:false
        }
    },
        { timestamps: true })

);
module.exports = plannedjournylocationModel;
