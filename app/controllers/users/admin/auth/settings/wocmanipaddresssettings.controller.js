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

exports.wipsettings = (req, res, next) => {
    
    var searchuserid = [];
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        
        if(req.userId && req.userId !== ''){
            searchuserid = {'userid': req.userId};
        }else{
            searchuserid = {'userid': {$not: null}};
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

            if (req.issettings == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }


           
            Wsetting.findOne({
                where: searchuserid
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

                const pushUser = users.id;
                const pushType = 'service';
                const pushBody = 'Dear ' + users.username + ", <br />You have Set Up your account " +
                                "to request check on your device each time you login. <br /> This would be sent to " +
                                "your email or as SMS. <br />It would be required to proceed your Login each time.<br/> This could also be reversed.";

                Helpers.pushNotice(pushUser, pushBody, pushType);

                var unboard = Helpers.returnBoolean(users.unboard);

                Wsetting.update(
                    {
                        securityipa: 1 
                    }, 
                    {
                        where : {id: wsettings.id}
                    }
                ).then( newsettings => {
                    Wsetting.findOne({
                        where: searchuserid
                    })
                    .then(updatedsettings => {
                        var securityipa = Helpers.returnBoolean(updatedsettings.securityipa);

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                deviceSettings: securityipa,
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
exports.nwipsettings = (req, res, next) => {
    var searchuserid = [];

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

            if(req.userId && req.userId !== ''){
                searchuserid = {'userid': req.userId};
            }else{
                searchuserid = {'userid': {$not: null}};
            }
           
            Wsetting.findOne({
                where: searchuserid
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

                const pushUser = users.id;
                const pushType = 'service';
                const pushBody = 'Dear ' + users.username + ", <br />You have Set Up your account " +
                                "not to check your device on login.<br/> This could also be reversed.";

                Helpers.pushNotice(pushUser, pushBody, pushType);

                Wsetting.update(
                    {
                        securityipa: 0
                    }, 
                    {
                        where : {id: wsettings.id}
                    }
                ).then( newsettings => {

                    Wsetting.findOne({
                        where: searchuserid
                    })
                    .then(updatedsettings => {
                        var securityipa = Helpers.returnBoolean(updatedsettings.securityipa);

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                deviceSettings: securityipa,
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
                    statusCode: 5050,
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