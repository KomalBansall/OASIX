const friendModel = require('../models/friend.model');
const userModel = require('../models/user.model');
const sendNotification = require('../controllers/notification.controller')
const { mongoose } = require('mongoose');
const userinterestModel = require('../models/userInterest.model');
const notificationModel = require('../models/notification.model');
const StaticNotifcation = require("../controllers/static.controller")


/**
 * @function sendNotification
 * @function StaticNotifcation
 * Send notification
 * static notification
 */

const sendFriendRequest = async (req, res) => {
    try {
        let { phoneNumber } = req.body;
        const userFind = await userModel.findOne({ phoneNumber: phoneNumber });

        if (userFind) {
            const requestData = {
                userId: req.user._id,
                friendId: userFuserFindind._id,
                status: false
            };

            const friendRequest = new friendModel(requestData);
            await friendRequest.save();
            const notificationData = await StaticNotifcation.sendfriendRequest(req.user, userFind._id);
            const notificationFind = await notificationModel.findOne({
                notificationData
            });

            if (!notificationFind) {
                await notificationModel.create(notificationData);

                if (userFind.deviceId) {
                    await sendNotification(notificationData, userFind.deviceId);
                }

                res.status(200).json({ status: "200", message: "Request sent successfully" });
            } else {
                res.status(200).json({ status: "400", message: "Request not sent" });
            }
        } else {
            res.status(400).json({ status: "400", message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "500", message: error.message });
    }
}

const acceptFriendRequest = async (req, res) => {
    try {
        let { _id } = req.body
        await friendModel.findByIdAndUpdate({ _id }, { status: true });
        const notificationData = await StaticNotifcation.newConnection(req.user._id, _id)
        const notificationFind = await notificationModel.findOne({
            notificationData
        });
        if (!notificationFind) {
            await notificationModel.create(notificationData);
        }
        await sendNotification(notificationData, deviceId)

        res.status(200).json({ status: "200", message: "Request accepted successfully" });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const rejectFriendRequest = async (req, res) => {
    try {
        let { _id } = req.body
        await friendModel.findByIdAndDelete({ _id });
        res.status(200).json({ status: "200", message: "Request rejected successfully" });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const getUserFriendRequests = async (req, res) => {
    try {
        const userRequests = await friendModel.find({ friendId: req.user, status: false }).populate("userId");
        const userRequestsCount = await friendModel.countDocuments({ friendId: req.user, status: false });
        const userInterests = await userinterestModel.find({ userId: new mongoose.Types.ObjectId(req.user) }).populate('interestId').select('interestId');
        const commonFriends = await friendModel.aggregate([
            {
                $match: {
                  $or: [
                    { userId: new mongoose.Types.ObjectId(req.user), status: true },
                    { friendId: new mongoose.Types.ObjectId(req.user), status: true },
                  ],
                },
              },
              {
                $group: {
                  _id: null,
                  userFriends: { $addToSet: '$friendId' },
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userFriends',
                  foreignField: '_id',
                  as: 'userFriendsDetails',
                },
              },
              {
                $unwind: '$userFriendsDetails',
              },
              {
                $lookup: {
                  from: 'friends',
                  let: { friendId: '$userFriendsDetails._id' },
                  pipeline: [
                    {
                      $match: {
                        $or: [
                            { $expr: { $eq: ['$userId', '$$friendId'] } },
                            { $expr: { $eq: ['$friendId', '$$friendId'] } }
                        ],
                        status: true,
                      },
                    },
                    {
                      $project: { friendId: 1 },
                    },
                  ],
                  as: 'friendsOfFriends',
                },
              },
              {
                $unwind: '$friendsOfFriends',
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'friendsOfFriends.friendId',
                  foreignField: '_id',
                  as: 'commonFriendsDetails',
                },
              },
              {
                $unwind: '$commonFriendsDetails',
              },
              {
                $group: {
                    _id: '$commonFriendsDetails',
                },
            },
            {
                $replaceRoot: { newRoot: '$_id' },
              }
            ]);
        res.status(200).json({ status: "200", message: "User friend Request successfully", response: userRequests,userRequestsCount,userInterests, commonFriends });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}


const getUserConnection = async (req, res) => {
    try {
        const userConnection = await friendModel.find({ $or: [{ userId: req.user, status: true }, { friendId: req.user, status: true }] }).populate({ path: 'userId', select: 'name profileImage' }).populate({ path: 'friendId', select: 'name profileImage' });
        res.status(200).json({ status: "200", message: "User connection fetched successfully", response: userConnection });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        const result = await userModel.find().skip(skip).exec();
        const totalDocuments = await userModel.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);
        return res.status(200).json({
            status: 200,
            message: "Users Retrieve Successfully",
            response: result,
            page: page,
            limit: limit,
            totalPages: totalPages,
            totalDocuments: totalDocuments
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getUserFriendRequests,
    getUserConnection,
    getAllUsers
}