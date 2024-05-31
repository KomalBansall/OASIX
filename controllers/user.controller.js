const userModel = require('../models/user.model');
const userInterestModel = require('../models/userInterest.model');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
var secret = speakeasy.generateSecret({ length: 20 });
const axios = require('axios'); // You may need to install this package
const membershipModel = require('../models/membership.model');
const friendModel = require('../models/friend.model');
const plannedModel = require('../models/plannedRequest.model');
const pushNotificationModel = require('../models/pushNotification.model');
const { accessToken } = require('../middleware/jwt');
// const { checkValidation } = require('../middleware/validation');


// Define the API endpoint


// const googleSignup = async (req, res) => {
//     const profileUrl = 'https://www.googleapis.com/oauth2/v1/userinfo'; // Google API endpoint for user information
//     const accessToken = "ya29.a0AfB_byDChWapGM5t8pdnkuOlhkzelFkdbJwi08a52I0e8DkiDdxAkvdmg9gfhsKqR_iTfLwBrEZVNJD06qg0EO1wMYrIm9HYaO54wEfMWYC4l9Pwlrkf1uQIZDneZE1BYx2AsH5fH3QhIB47eooFec3haHNsmivsCwaCgYKAXASARISFQGOcNnCrul4rpgbltIMdhPyv-7pxA0169";
//     axios.get(profileUrl, {
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//         },
//     })
//         .then(response => {
//             const userData = response.data;
//             console.log(userData);
//         })
//         .catch(error => {
//             console.error('Error fetching user profile:', error);
//         });
// }

const googleSignup = async (req, res) => {
    const accessToken = "EAAD8dtBRlNIBO6qzZBpbE2u5oTflf60X1mhjiXVmpnLZCqhjzxgIWbbZCIyTyOabrvUiki9fWfv4oQIRZAPZC1vQZCoeJ6zCZC9DBuZCxT3SmZCcJ5zBfRZClidvx5RsfuNFVdnK1JZBZCf89SmtLOT05X9HiUUGlV3nUESfxuOiqJ9leu9NCiksVJufpNdDIZC3LVwwBbE8wUECS2NIgw1l0Nz9Pl4eSZBk5sjSiGm6ZCi7IBWKLAZD";
    const fields = 'id,name,email';
    axios.get(`https://graph.facebook.com/v14.0/me?access_token=${accessToken}`)
        .then(response => {
            // Handle the response data here.
            console.log(response.data);
        })
        .catch(error => {
            // Handle any errors here.
            console.error(error);
        });
}

const test = async (req, res) => {
    await userInterestModel.find
}

//for sending otp
const sentOtp = async (req, res) => {
    try {
        const { phoneNumber, email } = req.body;
        // await checkValidation.validateAsync(req.body);
        const userExists = await userModel.findOne({ $or: [{ email: email }, { phoneNumber: phoneNumber }] });
        if (!userExists) {
            var otp = speakeasy.totp({
                secret: secret.base32,
                encoding: 'base32',
                digits: 6,
                window: 1
            });
            res.status(200).json({ status: "200", message: "Otp  for Verification", response: otp })
        }
        else {
            return res.status(200).json({ status: "400", message: "Phone Number or Email already exists" })
        }
    } catch (error) {
        return res.status(200).json({ status: "500", message: error.message })
    }
}


//for otp verification
const verifyOtp = async (req, res) => {
    try {
        let { email, phoneNumber, password, otp, longitude, latitude } = req.body;
        var verified = speakeasy.totp.verify({
            secret: secret.base32,
            encoding: 'base32',
            token: otp,
            digits: 6,
            window: 1

        });
        if (verified) {
            const hashedPassword = await bcrypt.hash(password, 10);
            password = hashedPassword;
            const location = {
                type: "Point",
                coordinates: [longitude, latitude]
            };
            const userCreate = await userModel.create({ email, phoneNumber, password, location });
            const result = await userModel.findById(userCreate._id).select('_id');
            await pushNotificationModel.create({ userId: result._id });
            res.status(200).json({ status: "200", message: "Otp  Verified Successfully", response: result })
        }
        else {
            res.status(200).json({ status: "400", message: "Otp is Incorrect" })
        }
    } catch (error) {
        return res.status(500).json({ status: "500", message: error.message })
    }
}


// User Profile Update  Api
const updateUserProfile = async (req, res) => {
    try {
        if (req.files) {
            const mappedFiles = req.files.map(file => {
                return `http://103.185.212.115:6500/images/${file.originalname}`;
            });
            if (req.body.indexes) {
                const indexes = JSON.parse(req.body.indexes).map(index => {
                    return index;
                });
                const updateQuery = {};
                indexes.forEach((index, i) => {
                    updateQuery[`profileImage.${index}`] = mappedFiles[i];
                });
                await userModel.findByIdAndUpdate({ _id: req.body._id }, { $set: updateQuery }, { new: true });
            }
            else {
                await userModel.findByIdAndUpdate({ _id: req.body._id }, { profileImage: mappedFiles }, { new: true });
            }
            res.status(200).json({ status: "200", message: "User Profile Updated successfully" });
        }
        else {
            const result = await userModel.findByIdAndUpdate({ _id: req.body._id }, req.body, { new: true }).select('_id');
            res.status(200).json({ status: "200", message: "User Profile Updated successfully", response: result });
        }
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password, longitude, latitude } = req.body;
        // await checkValidation.validateAsync({ email, password });
        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (isPasswordValid) {
                const token = await accessToken(existingUser);
                const location = {
                    type: "Point",
                    coordinates: [latitude, longitude]
                };
                await userModel.findByIdAndUpdate({ _id: existingUser.id }, { location: location })
                return res.status(200).json({
                    status: "200", message: "User logged in successfully", response: existingUser, token: token
                });
            }
            else {
                return res.status(200).json({ status: "400", message: "Incorrect password" });
            }
        }
        else {
            return res.status(200).json({ status: "400", message: "Invalid email" });
        }
    } catch (error) {
        return res.status(500).json({ status: "500", message: error.message, error: error.message });
    }
};

// const getUserInterest = async (req, res) => {
//     try {
//         let { userId } = req.query
//         const allInterest = await userInterestModel.aggregate([
//             {
//                 $match: { userId: new mongoose.Types.ObjectId(userId) },
//             },
//             {
//                 $lookup: {
//                     from: 'interests',
//                     localField: 'interestId',
//                     foreignField: '_id',
//                     as: 'interestData',
//                 },
//             },
//             {
//                 $unwind: '$interestData',
//             },
//             {
//                 $group: {
//                     _id: '$interestId',
//                     interests: { $first: "$interestData" },
//                 },
//             },
//         ]);
//         res.status(200).json({ status: "200", message: "User interest fetched successfully", response: allInterest });
//     } catch (error) {
//         res.status(500).json({ status: "500", message: error.message });
//     }
// }

const getUserProfile = async (req, res) => {
    try {
        const userData = await userModel.findById({ _id: req.user });
        res.status(200).json({ status: "200", message: "All interest fetched successfully", response: userData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: error.message });
    }
}

const profilePause = async (req, res) => {
    try {
        let { userId, pauseProfileStatus } = req.body
        const pauseProfileExist = await membershipModel.findOne({ userId: req.user, pauseProfileStatus: { $exists: true } });
        if (!pauseProfileExist) {
            await membershipModel.create({ userId, pauseProfileStatus });
            res.status(200).json({ status: "200", message: "Your account deactivated successfully" });
        }
        else {
            res.status(200).json({ status: "200", message: "Your account already deactivated " });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: error.message });
    }
}

const cancelMembership = async (req, res) => {
    try {
        await userModel.deleteOne({ _id: req.user });
        await friendModel.deleteMany({ userId: req.user });
        await plannedModel.deleteMany({ userId: req.user });
        await userInterestModel.deleteMany({ userId: req.user });
        res.status(200).json({ status: "200", message: "Your account deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const getUserPushNotification = async (req, res) => {
    try {
        const pushStatus = await pushNotificationModel.findOne({ userId: req.user });
        res.status(200).json({ status: "200", message: "All push notification status successfully", response: pushStatus });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const updateUserPushNotification = async (req, res) => {
    try {
        let { _id } = req.body
        const pushStatus = await pushNotificationModel.updateOne({ _id }, req.body);
        res.status(200).json({ status: "200", message: "Push notification status  updated successfully", response: pushStatus });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

module.exports = {googleSignup, updateUserProfile, userLogin, sentOtp, verifyOtp, getUserProfile, profilePause, cancelMembership, getUserPushNotification, updateUserPushNotification }















