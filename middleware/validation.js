const Joi = require('joi');
const ph_Pattern = /^\d{10}$/
module.exports.checkValidation = Joi.object({
    email: Joi.string().email(),
    phoneNumber: Joi.string().pattern(new RegExp(ph_Pattern)).message({ "string.pattern.base": "Please Enter Valid phoneNumber" }),
    password: Joi.string().min(8).message({ "string.pattern.base": "Please Enter Maximum 8 Length Password" })
})
