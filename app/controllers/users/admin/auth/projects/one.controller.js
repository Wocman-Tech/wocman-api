const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const Nletter = db.nletter;
const Contactus = db.contactus;
const Cert = db.cert;


const Projects = db.projects;
const Project = db.projecttype;
const Wshear = db.wshear;
const WAChat = db.waChat;
const WCChat = db.wcChat;
const WWallet = db.wWallet;
const Rootadmin = db.rootadmin;
const Account = db.accounts;
const Wrate = db.wrate;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const {v4 : uuidv4} = require('uuid');
const Joi = require('joi'); 
let nodeGeocoder = require('node-geocoder');
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
 
let options = {
    provider: 'openstreetmap'
};

let transporter = nodemailer.createTransport({
    service: config.message_server,
    secure: true,
    auth: {
        user: EMAIL,
        pass: PASSWORD,
    },
});

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: config.name,
        link: config.website,
    },
});

const Op = db.Sequelize.Op;


exports.projects = (req, res, next) => {
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        User.findByPk(req.userId)
        .then(users => {
            if (!users) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    data: []
                });
            }

            if (req.isproject == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            Projects.findAll({
                where: {'projectcomplete': 0}
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has not been completed",
                        data: []
                    });
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Uncompleted Projects",
                    data: {
                        project: checkUsers,
                        accessToken: req.token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
                        unboard: unboard
                    }
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
    }
};

exports.projects_filter = (req, res, next) => {
    var date_filter = req.body.date_filter;
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        if (typeof date_filter == "undefined") {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "include date_filter field",
                data: [] 
            });
        }

        User.findByPk(req.userId)
        .then(users => {
            if (!users) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    data: []
                });
            }

            if (req.isproject == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            var filter = '`%'+date_filter+'%`';
            Projects.findAll({
                where: {
                        'projectcomplete': 0,
                        // 'updatedAt': { [Op.Like]: filter }
                    }
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has been completed",
                        data: []
                    });
                }

                var theProjects = [];

                for (var i = 0; i < checkUsers.length; i++) {
                    var str = checkUsers[i].createdAt.toString();
                    if (typeof str == 'string'){
                        if(str.includes(date_filter.toString())) {
                            theProjects.push({checkUsers});
                        }
                    }
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Uncompleted Projects",
                    data: {
                        projects: theProjects,
                        accessToken: req.token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
                        unboard: unboard
                    }
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
    }
};

exports.projects_complete = (req, res, next) => {
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        User.findByPk(req.userId)
        .then(users => {
            if (!users) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    data: []
                });
            }

            if (req.isproject == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            Projects.findAll({
                where: {'projectcomplete': 1}
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has not been completed",
                        data: []
                    });
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found completed Projects",
                    data: {
                        project: checkUsers,
                        accessToken: req.token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
                        unboard: unboard
                    }
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
    }
};