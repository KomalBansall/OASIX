const mongoose = require('mongoose');
const membershipModel = mongoose.model(
    'membership', mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        oaxisUnlimited:{
            type:String
        },
        pauseProfile:{
            type:Boolean,
            default:true
        }
    },
        { timestamps: true })

);
module.exports = membershipModel;
