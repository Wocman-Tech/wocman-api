const baseUrl = "../../";
const db = require(baseUrl+"models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');

const schemaJoiEmail = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required()
});

const schemaJoiName = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .required()
});

const schemaJoiInquiry = Joi.object({
    inquiry: Joi.string()
        .min(3)
        .max(30)
        .required()
});

const schemaJoiPhone = Joi.object({
    phone: Joi.string()
        .min(9)
        .max(21)
        .required()
});


const schemaJoiMessage = Joi.object({
    message: Joi.string()
        .min(10)
        .max(250)
        .required()
});


isEmailVerify = (req, res, next) => {
    var joyresult = schemaJoiEmail.validate({ email: req.body.email });
    var { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
        var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: msgs,
            data: []
        })
    }else{
        next();
    }
};

isNameVerify = (req, res, next) => {
    var joyresult = schemaJoiName.validate({ name: req.body.name });
    var { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
         var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: msgs,
            data: []
        })
    }else{
        next();
    }
};

isInquiryVerify = (req, res, next) => {
    var joyresult = schemaJoiInquiry.validate({ inquiry: req.body.inquiry });
    var { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
         var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: msgs,
            data: []
        })
    }else{
        next();
    }
};

isPhoneVerify = (req, res, next) => {
    var joyresult = schemaJoiPhone.validate({ phone: req.body.phone });
    var { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
         var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: msgs,
            data: []
        })
    }else{
        next();
    }
};

isMessageVerify = (req, res, next) => {
    var joyresult = schemaJoiMessage.validate({ message: req.body.message });
    var { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
         var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: msgs,
            data: []
        })
    }else{
        next();
    }
};

const contactUs = {
    isEmailVerify: isEmailVerify,
    isNameVerify: isNameVerify,
    isInquiryVerify: isInquiryVerify,
    isPhoneVerify: isPhoneVerify,
    isMessageVerify: isMessageVerify
};

module.exports = contactUs;