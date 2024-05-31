const express = require("express");
const userRoute = express.Router();
const user = require('../controllers/user.controller');
const notification = require ('../controllers/notification.controller')

const { verifyToken } = require('../middleware/jwt');
const multer = require('multer')

const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: async function (req, file, cb) {
    let fileName = file.originalname;
    cb(null, fileName);
  },
});
//@function for seperating (form data)data
const upload = multer({ storage: storage });
//@function for seperating (form data)data
// userRoute.post('/register', user.registerUser);
userRoute.post('/userLogin',user.userLogin);
userRoute.put('/updateUserProfile',upload.array("file",6),user.updateUserProfile);
userRoute.post('/verifyOtp', user.verifyOtp);
userRoute.post('/sentOtp',user.sentOtp);
userRoute.get('/getUserProfile',verifyToken,user.getUserProfile);
userRoute.post('/profilePause',verifyToken,user.profilePause);
userRoute.delete('/cancelMembership',verifyToken,user.cancelMembership)
userRoute.get('/getUserPushNotification',verifyToken,user.getUserPushNotification);
userRoute.put('/updateUserPushNotification',user.updateUserPushNotification);
module.exports = userRoute;
