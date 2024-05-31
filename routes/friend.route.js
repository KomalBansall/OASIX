const express = require("express");
const friendRoute = express.Router();
const friend = require('../controllers/friend.controller');

const { verifyToken } = require('../middleware/jwt');

friendRoute.post('/sendFriendRequest',verifyToken,friend.sendFriendRequest);
friendRoute.put('/acceptFriendRequest',friend.acceptFriendRequest);
friendRoute.delete('/rejectFriendRequest',friend.rejectFriendRequest);
friendRoute.get('/getUserFriendRequests',verifyToken,friend.getUserFriendRequests);
friendRoute.get('/getUserConnection',verifyToken,friend.getUserConnection);
friendRoute.get('/getallusers',friend.getAllUsers)

module.exports = friendRoute