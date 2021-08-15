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

isAdmin = (req, res, next) => {

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
            res.status(403).send({
                statusCode: 403,
                status: false,
                message: "User Not Found",
                data: []
            });
            return;
        }
        UserRole.findOne({
          where:  {'userid': users.id}
        })
        .then(userrole => {
            if (!userrole) {
                res.status(403).send({
                    statusCode: 403,
                    status: false,
                    message: "Role not found",
                    data: []
                });
                return;
            }

            Role.findOne({
              where:  {'id': userrole.roleid}
            })
            .then(roles => {
                if (!roles) {
                    res.status(403).send({
                        statusCode: 403,
                        status: false,
                        message: "Require Customer Role!",
                        data: []
                    });
                    return;
                }
                if (roles.name == 'admin') {
                    req.email = users.email;
                    req.email_link = users.verify_email;
                    next();
                }else{
                    res.status(403).send({
                        statusCode: 403,
                        status: false,
                        message: "Role mis-matched",
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
};



const verifyAdminUser = {
    isAdmin: isAdmin
};
module.exports = verifyAdminUser;