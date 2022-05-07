const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Nletter = db.Nletter;
const Contactus = db.Contactus;

const Projects = db.Projects;
const Project = db.Projecttype;
const Wshear = db.Wshear;
const WAChat = db.WaChat;
const WCChat = db.WcChat;
const WWallet = db.WWallet;
const Rootadmin = db.Rootadmin;
const Account = db.Accounts;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const {v4 : uuidv4} = require('uuid');
const Joi = require('joi'); 
let nodeGeocoder = require('node-geocoder');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
 
let options = {
    provider: 'openstreetmap'
};


const Op = db.Sequelize.Op;

exports.islogin = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                islogin: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Login Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_islogin = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                islogin: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Login Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.isprofile = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isprofile: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Profile Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_isprofile = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isprofile: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Profile Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.issettings = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                issettings: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Settings Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_issettings = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                issettings: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Settings Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.iscustomer = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                iscustomer: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Customer Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_iscustomer = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                iscustomer: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Customer Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.iswocman = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                iswocman: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Wocmen Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_iswocman = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                iswocman: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Wocmen Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.isproject = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isproject: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Project Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_isproject = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isproject: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Project Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.isuser = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isuser: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "User Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_isuser = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isuser: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "User Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.isaccount = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isaccount: 1
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Account Enabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.cancel_isaccount = (req, res, next) => {

    var email = req.body.email;

    var Searchemail = {};

    Rootadmin.findOne({
        where: {'email': email}
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "User does not exist as admin",
                data: []
            });
        }
        Rootadmin.update(
            {
                isaccount: 0
            },
            {
                where: {'email': email}
            }
        );
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Account Disabled",
            data: {
            }
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};