const baseUrl = "../../";
const jwt = require("jsonwebtoken");
const config = require(baseUrl+"config/auth.config.js");
const db = require(baseUrl+"models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');
const Rootadmin = db.rootadmin;


isRootAdmin = (req, res, next) => {
    if (req.email) {
        searchemail = {'email': req.email};
    }

    Rootadmin.findOne({
        where: searchemail
    })
    .then(adminroot => {
        if (!adminroot) {
            res.status(403).send({
                statusCode: 403,
                status: false,
                message: "User Not Found",
                data: []
            });
            return;
        }
        if (parseInt(adminroot.isroot, 10) == 1) {
            next();
        }else{
            res.status(404).send({
                statusCode: 404,
                status: false,
                message: "Root Admin Required",
                data: []
            });
            return;
        }
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

const rootAction = {
    isRootAdmin: isRootAdmin
};
module.exports = rootAction;