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

exports.settings = (req, res, next) => {
    

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

            if (req.issettings == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
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
                        statusCode: 204,
                        status: false,
                        message: "Settings Not Found",
                        data: {
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }else{
                    var smsnotice = Helpers.returnBoolean(wsettings.smsnotice);
                    var emailnotice = Helpers.returnBoolean(wsettings.emailnotice);
                    var servicenotice = Helpers.returnBoolean(wsettings.servicenotice);
                    var technicalnotice = Helpers.returnBoolean(wsettings.technicalnotice);
                    var security2fa = Helpers.returnBoolean(wsettings.security2fa);
                    var securityipa = Helpers.returnBoolean(wsettings.securityipa);
                    var paymentschedule = Helpers.returnBoolean(wsettings.paymentschedule);
                    
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Found Notification Settings",
                        data: {
                            smsNotice: smsnotice,
                            emailNotice: emailnotice,
                            serviceNotice: servicenotice,
                            technicalNotice: technicalnotice,
                            twofactor: security2fa,
                            deviceSettings: securityipa,
                            paymentschedule: paymentschedule,
                            accessToken: req.token,
                            unboard: unboard
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
    }
};

exports.createsettings = (req, res, next) => {
    

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

            if (req.issettings == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
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
                    Wsetting.create({
                        userid: req.userId
                    });
                }
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Created Notification Settings",
                    data: {
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
    }
};