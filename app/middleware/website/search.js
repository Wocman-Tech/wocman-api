const baseUrl = "../../";
const db = require(baseUrl+"models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');

const schemaJoiSearchLocation = Joi.object({
    location: Joi.string()
        .alphanum()
        .min(3)
        .max(100)
        .required()
});

isSearchVerify = (req, res, next) => {
    var joyresult = schemaJoiSearchLocation.validate({ location: req.params.location });
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
   
const search = {
    isSearchVerify: isSearchVerify
};

module.exports = search;