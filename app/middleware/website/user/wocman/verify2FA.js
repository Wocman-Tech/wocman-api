
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
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()

});



is2FA = (req, res, next) => {
    next();
};


const verify2FA = {
    is2FA: is2FA
};

module.exports = verify2FA;