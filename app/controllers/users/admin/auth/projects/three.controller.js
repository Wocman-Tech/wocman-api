const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const Projects = db.Projects;
const Project = db.Projecttype;
const Wshear = db.Wshear;
const WAChat = db.WaChat;
const WCChat = db.WcChat;
const Account = db.Accounts;
const Wrate = db.Wrate;

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

exports.projects_no_schedule = (req, res, next) => {
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
            var filter = 'null';
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            Projects.findAll({
                where: {
                    'projectcomplete': 0,
                    // 'datetimeset': { [Op.Like]: filter }
                }
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has not been completed",
                        data: []
                    });
                }

                var quote = [];

                for (var i = 0; i < checkUsers.length; i++) {

                    if (checkUsers[i].datetimeset == null) {
                        var str = 'null';
                    }else{
                        var str = checkUsers[i].datetimeset.toString();
                    }

                    if (typeof str == 'string'){
                        if(str.includes(filter.toString())) {
                            quote.push({checkUsers});
                        }
                    }
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Projects with no schedule",
                    data: {
                        project: quote,
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

exports.projects_wocman = (req, res, next) => {
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
                where: {
                    'projectcomplete': 0,
                    'wocmanid': { [Op.gt]: 0 }
                }
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
                    message: "Found Projects with wocman",
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

exports.projects_no_wocman = (req, res, next) => {
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
            var filter = 'null';
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            Projects.findAll({
                where: {
                    'projectcomplete': 0,
                    // 'wocmanid': { [Op.like]: null }
                }
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has not been completed",
                        data: []
                    });
                }

                var quote = [];

                for (var i = 0; i < checkUsers.length; i++) {

                    if (checkUsers[i].wocmanid == null) {
                        var str = 'null';
                    }else{
                        var str = checkUsers[i].wocmanid.toString();
                    }

                    if (typeof str == 'string'){
                        if(str.includes(filter.toString())) {
                            quote.push({checkUsers});
                        }
                    }
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Projects with no wocman",
                    data: {
                        project: quote,
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

exports.delete_project = (req, res, next) => {
    var projectId = req.body.projectId;
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        if (typeof projectId == "undefined") {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "include projectId field",
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

            Projects.findByPk(projectId)
            .then(existProject => {
                if (existProject) {

                    Projects.destroy(
                    {
                        where: {'id': projectId}
                    });

                    Account.destroy(
                    {
                        where: {'projectid': projectId}
                    });

                    WAChat.destroy(
                    {
                        where: {'projectid': projectId}
                    });

                    WCChat.destroy(
                    {
                        where: {'projectid': projectId}
                    });

                    Wrate.destroy(
                    {
                        where: {'job': projectId}
                    });
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Project Erased",
                        data: {
                            accessToken: req.token,
                            isEmailVerified: isEmailVerified,
                            isProfileUpdated: isProfileUpdated,
                            unboard: unboard
                        }
                    });
                }else{
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Not found.",
                        data: []
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
    }
};