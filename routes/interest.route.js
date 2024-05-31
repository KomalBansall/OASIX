const express = require("express");
const interestRoute = express.Router();
const interest = require('../controllers/interest.controller');

const { verifyToken } = require('../middleware/jwt');

interestRoute.get('/getAllInterest',verifyToken,interest.getAllInterest);
interestRoute.post('/addInterest',interest.addInterest);
interestRoute.post('/addUserInterest',verifyToken,interest.addUserInterest);
interestRoute.get('/getUserInterest',verifyToken,interest.getUserInterest)
module.exports = interestRoute