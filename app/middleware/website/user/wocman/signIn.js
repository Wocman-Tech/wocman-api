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
        .pattern(new RegExp(/^[a-zA-Z0-9, ]*$/, 'Alphanumerics, space and comma characters')).required()

});

// /^[a-zA-Z0-9!@#$%&*]{3,25}$/
// ^[a-zA-Z0-9]{3,30}$
// ^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})
// /^[a-zA-Z0-9, ]*$/, 'Alphanumerics, space and comma characters'

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


checkRolesExisted = (req, res, next) => {

   if (typeof req.body.email === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Email field is undefined.",
                data: []
            }
        );
    }else{
        var searchemail = {};
        var userId = {};
       
        if(req.body.email && req.body.email !== ''){
            searchemail = {'email': req.body.email}
        }else{
            searchemail = {'email': {$not: null}};
        }
        User.findOne({
            where: searchemail
        })
        .then(users => {
            if (!users) {
                return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User Not found.",
                        data: []
                    });
            }
            if(users.id && users.id !== ''){
                userId = {'userid': users.id}
            }else{
                userId = {'userid': {$not: null}};
            }

            UserRole.findOne({
                where: userId
            })
            .then(userrole => {
                if (!userrole) {
                     return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User Role Not found.",
                        data: []
                    });
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
        })
        .catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    }
};
const verifySignIn = {
    isEmailVerify: isEmailVerify,
    isPasswordVerify: isPasswordVerify,
    checkRole: checkRolesExisted
};

module.exports = verifySignIn;