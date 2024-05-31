const mongoose = require('mongoose');
const interestModel = mongoose.model(
    'interest', mongoose.Schema({
        name: {
            type: String,            
        },  
        type:{
            type:String
        }           
    },
        { timestamps: true })

);
module.exports = interestModel;
