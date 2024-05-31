const mongoose = require('mongoose');
const userinterestModel = mongoose.model(
    'userinterest', mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        interestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "interest",
            required: true,
        }
    },
        { timestamps: true })

);
module.exports = userinterestModel;
