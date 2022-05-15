const baseUrl = "../../../../";
const { resolve, port, website, googleAppClientID }  = require(baseUrl + "config/auth.config");

const db = require(baseUrl+"models");
const {OAuth2Client} = require("google-auth-library");
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');

const client = new OAuth2Client(googleAppClientID);

const schemaJoiEmail = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required()
});
const schemaJoiPassword = Joi.object({
    password: Joi.string()
        .min(8)
        .max(30)
        .required()

});


const schemaJoiUsername = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
});

const schemaJoiMatchPassword = Joi.object({

    password: Joi.string()
        .min(8)
        .max(30)
        .required(),

    repeat_password: Joi.ref('password')
});

const schemaJoiOtp = Joi.object({
    otp: Joi.string().min(5).required()
});

isEmailVerify = (req, res, next) => {
    if (typeof req.body.email === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Include an email field",
                data: [] 
            }
        );
    }else{
        var joyresult = schemaJoiEmail.validate({ email: req.body.email });
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
isUsernameVerify = (req, res, next) => {
    if (typeof req.body.username === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Include a username filed",
                data: [] 
            }
        );
    }else{
        var joyresult = schemaJoiUsername.validate({ username: req.body.username });
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
    }
};
isPasswordVerify = (req, res, next) => {
    if (typeof req.body.password === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Include a password field",
                data: [] 
            }
        );
    }else{
        var joyresult = schemaJoiPassword.validate({ password: req.body.password});
        var { value, error } = joyresult;
        if (!(typeof error === 'undefined')) { 
            var msg = Helpers.getJsondata(error, 'details')[0];
            var msgs = Helpers.getJsondata(msg, 'message');
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Minimun of 8 characters and maximun of 30 characters  is required and no special character is required in password field',
                data: []
            })
        }else{
            next();
        }
    }
};
isPasswordConfirmed = (req, res, next) => {
    if (typeof req.body.repeat_password === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Include a repeat_password field",
                data: [] 
            }
        );
    }else{
        var joyresult = schemaJoiMatchPassword.validate({ password: req.body.password, repeat_password: req.body.repeat_password });
        var { value, error } = joyresult;
        if (!(typeof error === 'undefined')) { 
            var msg = Helpers.getJsondata(error, 'details')[0];
            var msgs = Helpers.getJsondata(msg, 'message');
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Minimum eight characters, at least one uppercase letter, one lowercase letter and one number  is required in repeat_password field',
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
isLinkVerify = (req, res, next) => {

    if (typeof req.body.emailLink === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Include an emailLink that would be sent to user email",
                data: [] 
            }
        );
    }else{
        var resrt6d = req.body.emailLink.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        if (resrt6d == null) {
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Invalid Email Link',
                data: []
            })
        }else{
            next();
        }
    }
};
isToken = (req, res, next) => {
    if (typeof req.body.tokenId === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Include a google token id",
                data: [] 
            }
        );
    }else{
        var tokenId  = req.body.tokenId;
        client.verifyIdToken({idToken : tokenId, audience : googleAppClientID})
        .then( response => {
            const {  email_verified, email, name } = response.payload;
            if(email_verified && email_verified === true){
                req.email = email;
                req.body.email = email;
                req.name = name;
                req.password = tokenId;
                next();
            }else{
                return res.status(422).json({
                    statusCode: 422,
                    status: false,
                    message: 'Invalid tokenId',
                    data: []
                });
            }
        })
        .catch(err => {
            return res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    }
};
checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Email
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
      if (user) {
        res.status(404).send({
            statusCode: 404,
            status: false,
            message: "Failed! Email is already in use!",
            data: []
        });
        return;
      }
      next();
    })
    .catch(err => {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
   
};
isLink  = (req, res, next) => {
    if (typeof req.body.verifylink === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "verifylink field not added",
                data: [] 
            }
        );
    }else{
        next();
    }
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    isEmailVerify: isEmailVerify,
    isUsernameVerify: isUsernameVerify,
    isPasswordVerify: isPasswordVerify,
    isLinkVerify: isLinkVerify,
    isToken : isToken,
    isPasswordConfirmed: isPasswordConfirmed,
    isOtp: isOtp,
    isLink: isLink
};
module.exports = verifySignUp;