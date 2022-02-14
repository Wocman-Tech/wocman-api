const baseUrl = "../../";
const jwt = require("jsonwebtoken");
const config = require(baseUrl+"config/auth.config.js");
const db = require(baseUrl+"models");
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');

const schemaJoiId = Joi.object({
    id: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .required()
});

isIdVerify = (req, res, next) => {
    var joyresult = schemaJoiId.validate({ id: req.params.id });
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


const VerifyId = {
  isIdVerify: isIdVerify
};
module.exports = VerifyId;