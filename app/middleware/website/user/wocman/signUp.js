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
        .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")).required()

});
// /^[a-zA-Z0-9!@#$%&*]{3,25}$/
// ^[a-zA-Z0-9]{3,30}$
// ^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})
// /^[a-zA-Z0-9, ]*$/, 'Alphanumerics, space and comma characters'
// "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
// ^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$

const schemaJoiUsername = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
});

const schemaJoiMatchPassword = Joi.object({

    password: Joi.string()
        .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")).required(),

    repeat_password: Joi.ref('password')
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

isUsernameVerify = (req, res, next) => {
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
};

isPasswordVerify = (req, res, next) => {
    var joyresult = schemaJoiPassword.validate({ password: req.body.password});
    var { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
        var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: 'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character is required in password field',
            data: []
        })
    }else{
        next();
    }
};

isPasswordConfirmed = (req, res, next) => {
    var joyresult = schemaJoiMatchPassword.validate({ password: req.body.password, repeat_password: req.body.repeat_password });
    var { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
        var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: 'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character is required in repeat_password field',
            data: []
        })
    }else{
        next();
    }
};

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

isLinkVerifyGoogle = (req, res, next) => {

    if (typeof req.body.redirectLink === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Include an redirectLink that would be used to return user unique token",
                data: [] 
            }
        );
    }else{
        var resrt6d = req.body.redirectLink.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        if (resrt6d == null) {
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Invalid redirectLink',
                data: []
            })
        }else{
            next();
        }
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

const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    isEmailVerify: isEmailVerify,
    isUsernameVerify: isUsernameVerify,
    isPasswordVerify: isPasswordVerify,
    isLinkVerify: isLinkVerify,
    isLinkVerifyGoogle : isLinkVerifyGoogle,
    isPasswordConfirmed: isPasswordConfirmed
};

module.exports = verifySignUp;