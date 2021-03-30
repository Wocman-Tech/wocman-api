const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.user;
const Role = db.role;
const UserRole = db.userRole;

const WWallet = db.wWallet;
const WWalletH = db.wWalletH;

const Wsetting = db.wsetting;

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

exports.emailNotice = (req, res, next) => {
    

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
            var unboard = Helpers.returnBoolean(users.unboard);

           
            Wsetting.findOne({
                where: {
                    userid: req.userId
                }
            })
            .then(wsettings => {
                if (!wsettings) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User has no settings.",
                        data: []
                    });
                }
                Wsetting.update(
                    {
                        emailnotice: 1
                    },
                    {
                        where: {id: wsettings.id}
                    }
                )
                .then( newsettings => {
                    Wsetting.findOne({
                        where: {userid: req.userId}
                    })
                    .then(updatedsettings => {
                        var emailnotice = Helpers.returnBoolean(updatedsettings.emailnotice);

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                emailNotice: emailnotice,
                                accessToken: req.token,
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
exports.nemailNotice = (req, res, next) => {
    

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
            var unboard = Helpers.returnBoolean(users.unboard);

           
            Wsetting.findOne({
                where: {
                    userid: req.userId
                }
            })
            .then(wsettings => {
                if (!wsettings) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User has no settings.",
                        data: []
                    });
                }

                Wsetting.update(
                    {
                        emailnotice: 0

                    },
                    {
                        where: {id: wsettings.id}
                    }
                )
                .then( newsettings => {

                    Wsetting.findOne({
                        where: {userid: req.userId}
                    })
                    .then(updatedsettings => {
                        var emailnotice = Helpers.returnBoolean(updatedsettings.emailnotice);
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                twofactor: emailnotice,
                                accessToken: req.token,
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