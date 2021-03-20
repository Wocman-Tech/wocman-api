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
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),

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
            message: msgs,
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
            message: msgs,
            data: []
        })
    }else{
        next();
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
    isPasswordConfirmed: isPasswordConfirmed
};

module.exports = verifySignUp;