const baseUrl = "../../../../";
const db = require(baseUrl+"models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');


const schemaJoiLink = Joi.object({
    link: Joi.string()
        .min(50)
        .max(1000)
        .required()
});

isLinkVerify = (req, res, next) => {
    var joyresult = schemaJoiLink.validate({ link: req.params.link });
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

const verifySignUpLink = {
    isLinkVerify: isLinkVerify
};

module.exports = verifySignUpLink;