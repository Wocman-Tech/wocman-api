const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const Wsetting = db.Wsetting;

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

const Op = db.Sequelize.Op;

exports.smsNotice = (req, res, next) => {
    
    var searchuserid  = [];
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

            var unboard = Helpers.returnBoolean(users.unboard);
           
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
                Wsetting.update(
                    {
                    smsnotice: 1 
                    }, 
                    {
                        where : {id: wsettings.id}
                    }
                ).then( newsettings => {

                    const pushUser = users.id;
                    const pushType = 'service';
                    const pushBody = 'Dear ' + users.username + ", <br />You have Set Up your account " +
                                    "to receive technical and service notice through SMS." +
                                    "<br/> This could also be reversed.";

                    Helpers.pushNotice(pushUser, pushBody, pushType);

                    Wsetting.findOne({
                        where: searchuserid
                    })
                    .then(updatedsettings => {
                        var smsnotice = Helpers.returnBoolean(updatedsettings.smsnotice);

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                smsNotice: smsnotice,
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
exports.nsmsNotice = (req, res, next) => {
    
    var searchuserid  = [];

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
                                "not to receive sms as technical and service notices. " +
                                "<br/> This could also be reversed.";

                Helpers.pushNotice(pushUser, pushBody, pushType);

                Wsetting.update(
                    {
                        smsnotice: 0
                    }, 
                    {
                        where : {id: wsettings.id}
                    }
                ).then( newsettings => {

                    Wsetting.findOne({
                        where: searchuserid
                    })
                    .then(updatedsettings => {
                        var smsnotice = Helpers.returnBoolean(updatedsettings.smsnotice);

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                smsNotice: smsnotice,
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