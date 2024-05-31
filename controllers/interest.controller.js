const interestModel = require('../models/interest.model');
const userinterestModel = require('../models/userInterest.model');
const userInterestModel = require('../models/userInterest.model');
const { mongoose } = require('mongoose');

const getAllInterest = async (req, res) => {
    try {
        let { name, type } = req.query
        const allInterest = await interestModel.find({ type: { $regex: new RegExp(type, 'i') }, name: { $regex: `^${name}`, $options: 'i' } });
        const userInterests = await userinterestModel.find({interestId:allInterest[0]._id,userId:req.user}).populate('interestId').select('interestId');
        res.status(200).json({ status: "200", message: "All interest fetched successfully", response: allInterest,userInterests});
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const addInterest = async (req, res) => {
    try {
        const { name, type } = req.body
        const interestExists = await interestModel.findOne({ name, type });
        if (!interestExists) {
            const addInterest = await interestModel({ name, type }).save();
            res.status(200).json({ status: "200", message: "Add interest successfully", response: addInterest });
        }
        else {
            res.status(200).json({ status: "200", message: "Interest Already Exists" });
        }

    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const addUserInterest = async (req, res) => {
    try {
        const { interests } = req.body
        const userInterestData = interests.map(interestId => ({
            userId: req.user,
            interestId: interestId
        }));
        const addInterest = await userInterestModel.insertMany(userInterestData);
        res.status(200).json({ status: "200", message: "Add user interest successfully", response: addInterest });
    } catch (error) {
        res.status(500).json({ status: "500", message: error.message });
    }
}

const getUserInterest = async (req, res) => {
    try {
        const result = await userInterestModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user) } },
            {
                $lookup: {
                    from: "interests",
                    localField: "interestId",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: "$interest"
            },
            {
                $group: {
                    _id: "$interest.type",
                    interests:  {$push: {
                        name: "$interest.name",
                        _id: "$interest._id"
                    }
                }
                }
            }
        ]);
        return res.status(200).json({ status: "200", message: "User Interest Data Fetched Successfully ", response: result });
    } catch (error) {
        return res.status(500).json({ status: "500", message: error.message });
    }
}





module.exports = { getAllInterest, addInterest, addUserInterest, getUserInterest }