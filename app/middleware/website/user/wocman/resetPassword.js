
const baseUrl = "../../../../";
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
const schemaJoiPassword = Joi.object({
    password: Joi.string()
        .alphanum()
        .min(8)
        .max(30)
        .required()

});
const schemaJoiOtp = Joi.object({
    otp: Joi.string().min(5).required()
});

isEmailVerify = (req, res, next) => {
    var email = req.body.email;
    if (typeof email === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "add a valid email field",
                data: [] 
            }
        );
    }else{
        var joyresult = schemaJoiEmail.validate({ email: email });
        var { value, error } = joyresult;
        if (!(typeof error === 'undefined')) { 
            var msg = Helpers.getJsondata(error, 'details')[0];
            var msgs = Helpers.getJsondata(msg, 'message');
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Invalid Email Address',
                data: []
            })
        }else{
            next();
        }
    }
};



isPasswordVerify = (req, res, next) => {
    var password = req.body.password;
    if (typeof password === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "add a valid password field",
                data: [] 
            }
        );
    }else{
        var joyresult = schemaJoiPassword.validate({ password: password});
        var { value, error } = joyresult;
        if (!(typeof error === 'undefined')) { 
            var msg = Helpers.getJsondata(error, 'details')[0];
            var msgs = Helpers.getJsondata(msg, 'message');
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Minimun of 8 alphanumeric characters and maximun of 30 alphanumeric characters  is required in password field',
                data: []
            })
        }else{
            next();
        }
    }
};


isOtp = (req, res, next) => {
    var otpToken = req.body.otpToken;
    if (typeof otpToken === "undefined" || otpToken.length != 6) {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "add a valid otpToken field",
                data: [] 
            }
        );
    }else{
        var joyresult = schemaJoiOtp.validate({ otp: otpToken });
        var { value, error } = joyresult;
        if (!(typeof error === 'undefined')) { 
            var msg = Helpers.getJsondata(error, 'details')[0];
            var msgs = Helpers.getJsondata(msg, 'message');
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Minimum and maximun of six characters field is required',
                data: []
            })
        }else{
            next();
        }
    }
}

const verifyResetIn = {
    isEmailVerify: isEmailVerify,
    isPasswordVerify: isPasswordVerify,
    isOtp: isOtp
};

module.exports = verifyResetIn;