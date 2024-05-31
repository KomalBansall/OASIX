const mongoose = require('mongoose');
const pushNotificationModel = mongoose.model(
    'pushnotification', mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        PlanAndActivities: {
            type: Boolean,
            default: true
        },
        PrivateContactsRequests: {
            type: Boolean,
            default: true
        },
        NewConnections: {
            type: Boolean,
            default: true
        },
        PeopleSuggestions: {
            type: Boolean,
            default: true
        },
        Messages: {
            type: Boolean,
            default: true
        }
    },
        { timestamps: true })

);
module.exports = pushNotificationModel;
