const notificationModel = require('../models/notification.model');

const sendfriendRequest = async (notificationFromId, notificationToId) => {
  const notificationData = {
    notificationFromId: notificationFromId,
    notificationToId: notificationToId,
    notificationType: 'private contact requests ',
    notification: `You have a new friend request `,
  }
  return notificationData
}

const newConnection = async (notificationFromId, notificationToId) => {
  const notificationData = {
    notificationFromId: notificationFromId,
    notificationToId: notificationToId,
    notificationType: 'new connection ',
    notification: `accepted your friend request `,

  }
  return notificationData
}

const planRequest = async (userId, sendId) => {
  const notificationData = {
    // sendId: sendId,
    notificationFromId: userId,
    notificationToId: sendId,
    notificationType: 'Plan Request Recived',
    notification: `Plan Request Recived `,

  }
  return notificationData
}

module.exports = {
  sendfriendRequest,
  newConnection,
  planRequest
};













































