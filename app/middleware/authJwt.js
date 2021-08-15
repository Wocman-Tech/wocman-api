const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Helpers = require("../helpers/helper.js");
const Joi = require('joi');

verifyToken = (req, res, next) => {
    let token = req.headers.authorization;
    // console.log(token);

    if (!token) {
        return res.status(403).send({
            statusCode: 403,
            status: false, 
            message: "No token provided!",
            data: []
        });
    }

    const { headers, body, params } = req; 
    const joyvalidateSchema = Joi.object().keys({ 
        authorization: Joi.string().required().min(100)
    }).options({ allowUnknown: true })
    
    const joyresult = joyvalidateSchema.validate(headers);
    const { value, error } = joyresult;
    if (!(typeof error === 'undefined')) { 
        var msg = Helpers.getJsondata(error, 'details')[0];
        var msgs = Helpers.getJsondata(msg, 'message');
        return res.status(422).json({
            statusCode: 422,
            status: false,
            message: msgs,
            data:[]
        })
    }

    token = token.replace('Bearer ', '');

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).send({
            statusCode: 401,
            status: false,
            message: "Unauthorized!",
            data: []
          });
        }

        User.findByPk(decoded.id).then(users => {
            if (!users) {
                res.status(403).send({
                    statusCode: 403,
                    status: false,
                    message: "User Not Found",
                    data: []
                });
                return;
            }
            if (users.weblogintoken !== token) {
                return res.status(403).send({
                    statusCode: 403,
                    status: false,
                    message: "Token is blacklisted",
                    data: []
                });
            }
            req.userId = decoded.id;
            req.token = token;
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
    });
};

isAdmin = (req, res, next) => {

    User.findByPk(req.userId).then(users => {
        if (!users) {
            res.status(403).send({
                statusCode: 403,
                status: false,
                message: "Admin User Not Found",
                data: []
            });
            return;
        }
        UserRole.findOne({
          where:  {'userid': req.userId}
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
                        message: "Require Admin Role!",
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

isWocman = (req, res, next) => {
    User.findByPk(req.userId).then(users => {
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
          where:  {'userid': req.userId}
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
                        message: "Require Wocman Role!",
                        data: []
                    });
                    return;
                }
                if (roles.name == 'wocman') {
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
            if (parseInt(users.loginlogout,10)==1) {
                return res.status(403).send({
                    statusCode: 403,
                    status: false,
                    message: "Logged out.",
                    data: {
                        accessToken: null
                    }
                });
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
};

isCustomer = (req, res, next) => {
    User.findByPk(req.userId).then(users => {
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
          where:  {'userid': req.userId}
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
                if (roles.name == 'customer') {
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


const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isWocman: isWocman,
  isCustomer: isCustomer
};
module.exports = authJwt;