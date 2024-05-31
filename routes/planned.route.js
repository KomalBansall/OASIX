const express = require("express");
const plannedRoute = express.Router();
const planned = require('../controllers/planned.controller');
const { verifyToken } = require('../middleware/jwt');



plannedRoute.post('/createUserPlanned', verifyToken, planned.createUserPlanned);
plannedRoute.put('/acceptPlannedRequest', verifyToken, planned.acceptPlannedRequest);
plannedRoute.get('/getUserPlannedRequest', verifyToken, planned.getUserPlannedRequest);
plannedRoute.post('/sendPlannedRequest', verifyToken, planned.sendPlannedRequest);
plannedRoute.get('/getPlannedLocations', verifyToken, planned.getPlannedLocations);
plannedRoute.get('/getUserPlanHistory', verifyToken, planned.getUserPlanHistory);
plannedRoute.put("/savePlannedLocation", planned.savePlannedLocation);
plannedRoute.get('/getSavedPlannedLocation', verifyToken, planned.getSavedPlannedLocation);
plannedRoute.get("/getCalanderData", verifyToken, planned.getCalanderData);
plannedRoute.get('/getUserNotification',verifyToken,planned.getUserNotification);
module.exports = plannedRoute