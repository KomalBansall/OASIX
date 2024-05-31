const mongoose = require('mongoose');
const notificationModel = mongoose.model(
  'notification', mongoose.Schema({

    notificationType: {
      type: String
    },
    notificationFromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    notificarionToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    notificationType: {
      type: String
    },
    notification: {
      type: String
    },
  },

    { timestamps: true })

);
module.exports = notificationModel;
