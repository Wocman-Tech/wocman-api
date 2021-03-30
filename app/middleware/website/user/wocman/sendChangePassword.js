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
                message: "Invalid Email Address",
                data: []
            })
        }else{
            next();
        }
    }
};

const sendChangePassword = {
    isEmailVerify: isEmailVerify
};

module.exports = sendChangePassword;