const plannedJourneyModel = require("../models/plannedJourney.model")
const plannedRequestModel = require("../models/plannedRequest.model")
const plannedjournylocationModel = require('../models/plannedJourneyLocation.model');
const notificationModel = require('../models/notification.model');
const StaticNotifcation = require("../controllers/static.controller");
const OpenAIApi = require('openai');
const axios = require('axios');
const friendModel = require("../models/friend.model")
const userModel = require("../models/user.model");
const plannedJourneyFriendModel = require("../models/plannedJourneyFriends.model");
const mongoose = require("mongoose");
const plannedjournyModel = require("../models/plannedJourney.model");

var getDistanceAndTime = async (originLongitude, originLatitude, destinationLongitude, destinationLatitude) => {
    try {
        const ORIGIN_LATITUDE = originLongitude;
        const ORIGIN_LONGITUDE = originLatitude;
        const DESTINATION_LATITUDE = destinationLatitude;
        const DESTINATION_LONGITUDE = destinationLongitude;
        const response = await axios.get(`${process.env.GOOGLEDISTANCEKEY}=${ORIGIN_LATITUDE},${ORIGIN_LONGITUDE}&destinations=${DESTINATION_LATITUDE},${DESTINATION_LONGITUDE}`);
        const distanceText = response.data.rows[0].elements[0].distance.text
        return distanceText
    } catch (error) {
        return "N/A";
    }
}

//get places images from googleApi's
var getPlacesImages = async (long, lat) => {
    try {
        const apiKey = process.env.GOOGLEIMAGEKEY;
        const latitude = lat;
        const longitude = long;
        const getPlacedId = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
        const placeId = getPlacedId.data.results[0].place_id;
        const placeDetailsUrl = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`);
        const photoReference = placeDetailsUrl.data.result.photos[0].photo_reference;
        const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
        return imageUrl
    }
    catch (error) {
        return "N/A";
    }
}

// Make a POST request to the GPT-3 Completions API
const Chatgpt = async (destinationName, plannedId, interests, budget, userId) => {
    const openai = new OpenAIApi({ apiKey: process.env.CHATGPTKEY });
    try {
        const userInfo = await userModel.findOne({ _id: userId });
        let journeyCheck = [];
        let count = 0;
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a chatbot that finds places by user interests.' },
                { role: 'user', content: `Find tourist places in ${destinationName} according to my interests like ${interests} with ${budget} budget. provide place cooordinates and place name also provide with name field not with  a serial number ,total avegarge ratings and reviews by user of this location,average rating,phoneNumber,websites provide an array,place description,average cost of per person and today events please data provide with these fields.` }
            ],
            stream: true,
        });
        const chunks = [];
        for await (const chunk of response) {
            chunks.push(chunk.choices[0].delta.content);
        }
        const chatResponse = chunks.join('');
        const strRp = chatResponse.replace(/'/g, '"');
        const inputString = strRp.replace(/-/g, '');
        const locationsArray = inputString.split('\n\n').map(location => {
            const lines = location.split('\n').filter(line => line.trim() !== '');
            const locationObject = {};
            lines.forEach(line => {
                const [key, value] = line.split(':').map(item => item.trim());
                let mainKey = key.includes("Name") || key.includes("Place") || key.includes("PlaceName") ? key.replace(/[^a-zA-Z\s]/g, '') : key.replace(/[^a-zA-Z\s]/g, 'Name');
                locationObject[mainKey.trim().replace(/ /g, "")] = value;
            });
            return locationObject;
        });
        for (let i = 0; i < locationsArray.length; i++) {
            if (i > 0) {
                if (locationsArray[i].Coordinates && (locationsArray[i].Place || locationsArray[i].Name || locationsArray[i].PlaceName)) {
                    const locationCoordinates = await locationsArray[i].Coordinates.split(",");
                    const longitudeCoordinate = await locationCoordinates[1].split(/[NSEW]/);
                    const latitudeCoordinate = await locationCoordinates[0].split(/[NSEW]/);
                    const distance = await getDistanceAndTime(userInfo.location.coordinates[0], userInfo.location.coordinates[1], parseFloat(longitudeCoordinate), parseFloat(latitudeCoordinate));
                    const locationImage = await getPlacesImages(parseFloat(longitudeCoordinate), parseFloat(latitudeCoordinate));
                    const location = {
                        type: "Point",
                        coordinates: [parseFloat(latitudeCoordinate[0]), parseFloat(longitudeCoordinate[0])]
                    };
                    const plannedData = {
                        plannedJouranyId: plannedId,
                        userId: userId,
                        destinationName: locationsArray[i].Place || locationsArray[i].Name || "N/A",
                        destinationCoordinates: location || "N/A",
                        averageRating: locationsArray[i].AverageRating || locationsArray[i].Averagerating || locationsArray[i].Rating || "N/A",
                        phoneNumber: locationsArray[i].PhoneNumber || locationsArray[i].Phonenumber || "N/A",
                        description: locationsArray[i].Description || locationsArray[i].PlaceDescription || "N/A",
                        website: locationsArray[i].Website || "N/A",
                        averageCostperPerson: locationsArray[i].AverageCostperPerson || locationsArray[i].AverageCost || locationsArray[i].Averagecostperperson || locationsArray[i].AverageCostperperson || locationsArray[i].AverageCostNameperpersonName || "N/A",
                        review: locationsArray[i].Review || locationsArray[i].Reviews || locationsArray[i].ReviewsandRatings || locationsArray[i].Reviewsandratings || "N/A",
                        todayEvents: locationsArray[i].TodayNamesEvents || locationsArray[i].TodayNamesevents || "N/A",
                        distance: distance,
                        image: locationImage
                    }
                    await plannedjournylocationModel.create(plannedData);
                    count += 1
                    journeyCheck.push(true);
                }
                else {
                    journeyCheck.push(false);
                }
            }
            if (locationsArray.length - 1 == i) {
                if (!journeyCheck.includes(true)) {
                    return false
                };
            }
            if (locationsArray.length - 1 == i) {
                await plannedJourneyModel.findByIdAndUpdate({ _id: plannedId }, { totalActivities: count }, { new: true })
                return true;
            }
        }
    }
    catch (error) {
        return error
    }
}
//call chatGpt again if it  return false
const callChatgptWithRetry = async (destinationName, plannedId, interests, budget, userId) => {
    const chatGptResponse = await Chatgpt(destinationName, plannedId, interests, budget, userId);
    if (!chatGptResponse) {
        // If the response is false, call the function again 
        return callChatgptWithRetry(destinationName, plannedId, interests, budget, userId);
    }
    // If the response is not false, return it
    return chatGptResponse;
}

// create User Plan
const createUserPlanned = async (req, res) => {
    try {
        const { destinationName, latitude, day, longitude, startDate, endDate,budget, interestsId ,interests} = req.body;
        const location = {
            type: "Point",
            coordinates: [latitude, longitude]
        };
        const plannedJourneyData = {
            userId: req.user,
            destinationName,
            destinationCoordinates: location,
            day,
            startDate,
            endDate,
            budget,
            interestsId
        };
        const plannedJourney = await plannedJourneyModel.create(plannedJourneyData);
        // Call function to handle planned journey locations
        const finalChatGptResponse = await callChatgptWithRetry(destinationName, plannedJourney._id, interests, budget, req.user);
        if (finalChatGptResponse) {
            res.status(200).json({ status: 200, message: "User planned created successfully", response: plannedJourney });
        }
        else {
            res.status(200).json({ status: 200, message: "User planned not created successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }
};

const getPlannedLocations = async (req, res) => {
    try {
        // let plannedArray = [];
        // const plannedLocation = await plannedjournylocationModel.find({ plannedJouranyId: req.query.plannedId });
        // for (let i = 0; i < plannedLocation.length; i++) {
        //     const findPeople = await plannedjournylocationModel.find({ destinationName: plannedLocation[i].destinationName, status: true }).populate("userId", "name profileImage");
        //     const peopleIds = findPeople.map(user => {
        //         return  user.userId
        //     })
        //     plannedLocation[i].set("hello","heo    ")
        //     await plannedLocation[i].save()
        //     plannedArray.push(plannedLocation[i],peopleIds);
        //     if(plannedLocation.length-1 == i){
        //         res.status(200).json({ status: 200, message: "get planned locations fetched successfully", response: plannedArray });
        //     }
        // }
        const plannedLocation = await plannedjournylocationModel.aggregate([
            {
                $match: { plannedJouranyId: new mongoose.Types.ObjectId(req.query.plannedId) }
            },
            {
                $lookup: {
                    from: "plannedjourneylocations",
                    localField: "destinationName",
                    foreignField: "destinationName",
                    as: "people"
                }
            },
            {
                $addFields: {
                    "people": {
                        $filter: {
                            input: "$people",
                            as: "person",
                            cond: { $eq: ["$$person.status", true] }
                        }
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "people.userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $lookup: {
                    from: "plannedjourneys",
                    localField: "plannedJouranyId",
                    foreignField: "_id",
                    as: "data"
                }
            },
            {
                $lookup: {
                    from: "userinterests",
                    localField: "data.interestsId",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $lookup: {
                    from: "interests",
                    localField: "interest.interestId",
                    foreignField: "_id",
                    as: "interestData"
                }
            },
            {
                $addFields: {
                    "people.userData": { $first: { $arrayElemAt: [["$userData"], 0] } }
                },
            },
            {
                $group: {
                    _id: "$_id",
                    locations: { $first: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    "locations._id": 1,
                    "locations.destinationName": 1,
                    "locations.destinationCoordinates": 1,
                    "locations.image": 1,
                    "locations.distance": 1,
                    "locations.averageRating": 1,
                    "locations.phoneNumber": 1,
                    "locations.description": 1,
                    "locations.website": 1,
                    "locations.averageCostperPerson": 1,
                    "locations.review": 1,
                    "locations.todayEvents": 1,
                    "locations.people.userData.profileImage": 1,
                    "locations.people.userData.name": 1,
                    "locations.people.userData.profileImage": 1,
                    "locations.interestData.name": 1,
                }
            }
        ]);
        // const userInterests = await plannedJourneyModel.findById({ _id: req.query.plannedId }).populate('interestId');
        res.status(200).json({ status: 200, message: "User planned created successfully", response: plannedLocation });
    }
    catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}
// send planned request 
const sendPlannedRequest = async (req, res) => {
    try {
        const { sendId, plannedId } = req.body;
        const plannedRequestData = sendId.map((id) => ({
            userId: req.user,
            requestId: id,
            plannedId: plannedId
        }));
        await plannedRequestModel.insertMany(plannedRequestData);
        //  function for handle Notifications
        sendId.forEach(async sendId => {
            const notificationData = await StaticNotifcation.planRequest(req.user, sendId);
            const notificationFind = await notificationModel.findOne({ notificationData });
            if (!notificationFind) {
                await notificationModel.create(notificationData);
                if (sendId.deviceId) {
                    await sendNotification(notificationData, sendId.deviceId);
                }
            }
        })
        res.status(200).json({ status: 200, message: "Planned request sent successfully", response: plannedRequestData });
    }
    catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}
// get user planned requests
const getUserPlannedRequest = async (req, res) => {
    try {
        const search = req.query.search;
        const resultArray = [];
        if (search.length == 0) {
            const plannedRequests = await plannedRequestModel.find({ requestId: req.user, status: false }).distinct('userId').populate('plannedId');
            const plannedjourneyData = await plannedJourneyModel.find({ userId: plannedRequests, status: false });
            return res.status(200).json({
                status: true,
                message: "Planned requests",
                response: plannedjourneyData,
            });
        } else {
            const users = await userModel.find({ name: { $regex: search, $options: 'i' } }).distinct('_id');
            const plannedjourneyNameSearch = await plannedRequestModel.find({ requestId: req.user, userId: users, status: false }).populate('plannedId').select('plannedId');
            resultArray.push(plannedjourneyNameSearch);
            const destinationSearch = await plannedJourneyModel.find({ userId: userId, destinationName: { $regex: search, $options: 'i' }, status: false }).distinct('_id');
            const plannedDestinationSearch = await plannedRequestModel.find({ plannedId: destinationSearch, requestId: req.user, status: false }).populate('plannedId').select('plannedId');
            resultArray.push(plannedDestinationSearch);
            res.status(200).json({ status: 200, message: "Planned Requests", response: resultArray });
        }
    } catch (error) {
        // console.error(error);
        res.status(500).json({ error: error.message });
    }
};



// Accept Plan Request
const acceptPlannedRequest = async (req, res) => {
    try {
        let { _id } = req.body
        const plannedRequest = await plannedRequestModel.findById({ _id }).select('plannedId requestId');
        await plannedJourneyModel.findByIdAndUpdate({ _id: plannedRequest.plannedId }, { status: true });
        await plannedJourneyFriendModel.create({
            friendId: plannedRequest.requestId,
            plannedId: plannedRequest.plannedId,
        })
        res.status(200).json({ status: "200", message: "Planned request accepted successfully", response: plannedRequest });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: error.message });
    }
}
// save Plan location
const savePlannedLocation = async (req, res) => {
    try {
        let { _id } = req.body
        await plannedjournylocationModel.findByIdAndUpdate(_id, { status: true });
        res.status(200).json({ status: "200", message: "Planned location  saved successfully" });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

// get saved planned locations
const getSavedPlannedLocation = async (req, res) => {
    try {
        const saveLocations = await plannedjournylocationModel.find({ userId: req.user, status: true });
        res.status(200).json({ status: "200", message: "Planned location  fetched successfully", response: saveLocations });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

// get saved planned locations
const getCalanderData = async (req, res) => {
    try {
        let plannedIdArray = [];
        const userLocation = await userModel.findOne({ _id: req.user }).select('profileImage location name ');
        const journeyPlanns = await plannedJourneyModel.countDocuments({ userId: req.user });
        const saveLocations = await plannedjournylocationModel.countDocuments({ userId: req.user, status: true });
        const connection = await friendModel.countDocuments({ $or: [{ userId: req.user, status: true }, { friendId: req.user, status: true }] });
        const date = new Date();
        date.setHours(5, 30, 0, 0);
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(5, 30, 0, 0);
        const todayAllData = await plannedJourneyModel.find({ startDate: { $gte: date, $lt: nextDate } }).distinct('_id');
        const plannedData = await plannedJourneyModel.find({ userId: req.user, _id: todayAllData }).distinct('_id');
        plannedIdArray.push(plannedData);
        const plannedFriendData = await plannedJourneyFriendModel.find({ friendId: req.user, plannedId: todayAllData }).distinct('plannedId');
        plannedIdArray.push(plannedFriendData);
        const todayPlanned = await plannedJourneyModel.find({ _id: plannedIdArray });
        plannedIdArray = [];
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
        const currentMonthData = await plannedJourneyModel.find({ startDate: { $gte: firstDayOfMonth, $lt: lastDayOfMonth } }).distinct('_id');
        const currentPlannedData = await plannedJourneyModel.find({ userId: req.user, _id: currentMonthData }).distinct('_id');
        plannedIdArray.push(currentPlannedData);
        const currentPlannedFriendData = await plannedJourneyFriendModel.find({ friendId: req.user, plannedId: currentMonthData }).distinct('plannedId');
        plannedIdArray.push(currentPlannedFriendData);
        const currentMonthPlanned = await plannedJourneyModel.find({ _id: plannedIdArray });
        res.status(200).json({ status: "200", message: "Planned location  fetched successfully", response: todayPlanned, userLocation, journeyPlanns, saveLocations, connection, currentMonthPlanned });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}


// Get User Planned History
// const getUserPlanHistory = async (req, res) => {
//     try {
//         const search = req.query.search;
//         const resultArray = [];
//         if (search.length == 0) {
//             const plannedIdData = await plannedJourneyModel.find({ userId: req.user }).distinct('_id');
//             resultArray.push(plannedIdData);
//             const plannedJourneyFriends = await plannedJourneyFriendModel.find({ friendId: req.user }).distinct('plannedId');
//             resultArray.push(plannedJourneyFriends);
//             const planId = await plannedJourneyModel.find({ _id: resultArray.flat() });
//             res.status(200).json({ status: "200", message: "User Planned History fetched successfully", response: planId });
//         }
//         else {
//             const users = await userModel.find({ name: { $regex: search, $options: 'i' } })
//             const plannedUserId = users.map(user => user._id);
//             resultArray.push(plannedUserId);

//             // const plannedjourneyNameSearch = await plannedJourneyModel.find({ userId: plannedUserId });
//             // resultArray.push(plannedjourneyNameSearch);

//             const destinationSearch = await plannedJourneyModel.find({ userId: plannedUserId, destinationName: { $regex: search, $options: 'i' } });

//             const plannedDestination = await plannedJourneyFriendModel.find({ friendId: req.user }).populate('plannedId')
//             resultArray.push(plannedDestination)

//             res.status(200).json({ status: "200", message: "User Planned History fetched successfully", response: resultArray })
//         }
//     }
//     catch (error) {
//         console.log(error);
//         res.status(500).json({ status: "500", message: error.message });
//     }
// }


const getUserPlanHistory = async (req, res) => {
    try {
        const search = req.query.search;
        const resultArray = [];
        if (search.length == 0) {
            const loginUserplan = await plannedJourneyModel.find({ userId: req.user })
            const userId = loginUserplan.map(request => request.userId);
            // console.log(loginUserplan);
            resultArray.push(loginUserplan);

            const plannedJorneyId = await plannedJourneyFriendModel.find({ friendId: req.user }).distinct('plannedId');
            resultArray.push(plannedJorneyId);
            // console.log('_id planned journey Id',plannedJorneyId);

            const userHistoryPlans = await plannedJourneyModel.find({ _id: resultArray.flat() });
            // console.log('user History Plans', userHistoryPlans);

            res.status(200).json({ status: "200", message: "User Planned History fetched successfully", response: userHistoryPlans });
        }
        else {
            const users = await userModel.find({ name: { $regex: search, $options: 'i' } }).distinct('_id')
            // console.log('userID', users);

            const nameSearch = await plannedJourneyModel.find({ userId: users });
            // console.log('search name', search, 'user Model Name search data', nameSearch);
            resultArray.push(nameSearch);
            const destination = await plannedJourneyModel.find({ destinationName: { $regex: search, $options: 'i' } }).distinct('_id');
            const destinationSearch = await plannedJourneyFriendModel.find({ plannedId: { $in: destination } }).populate('plannedId');
            resultArray.push(destinationSearch);
            // console.log('destinationSearchData', destinationSearch);


            res.status(200).json({ status: "200", message: "User Planned History fetched successfully", response: resultArray });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: error.message });
    }
}

// get User Notification
const getUserNotification = async (req, res) => {
    try {
        const userFind = await userModel.findOne({ userId: req.user });

        const notifications = await notificationModel.find({ not0ificationToId: req.user });

        return res.status(200).json({ status: '200', message: 'Notifications Fetched Successfully', response: notifications });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};


module.exports = {
    createUserPlanned,
    acceptPlannedRequest,
    sendPlannedRequest,
    getUserPlannedRequest,
    getPlannedLocations,
    savePlannedLocation,
    getSavedPlannedLocation,
    getCalanderData,
    getUserPlanHistory,
    getUserNotification

}