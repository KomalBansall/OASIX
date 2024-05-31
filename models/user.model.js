const mongoose = require('mongoose');
const userModel = mongoose.model(
    'user', mongoose.Schema({
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String
        },
        connectionSetting: {
            type: Number,
            enum: [1, 2, 3]
        },
        name: {
            type: String
        },
        instagram: {
            type: String
        },
        dob: {
            type: Date
        },
        gender: {
            type: String
        },
        jobTitle: {
            type: String
        },
        jobTitleName: {
            type: String
        },
        industry: {
            type: String
        },
        company: {
            type: String
        },
        about: {
            type: String
        },
        age: {
            type: Number
        },
        genderPreference: {
            type: String
        },
        profileImage: {
            type: Array
        },
        deviceId: {
            type: String
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
            },
        },
        hideStatus: {
            type: Boolean,
            default: true
        }
    },
        { timestamps: true })

);
module.exports = userModel;
