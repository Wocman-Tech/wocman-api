const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const Wblackliist = db.Ipblacklist;

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

exports.blacklistsettings = (req, res, next) => {
    
    var searchuserid = [];
    var ipAddress = req.body.ipaddress;
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        if (typeof ipAddress == "undefined") {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Undefiened ipaddress field",
                data: [] 
            });
        }else{
            if(req.userId && req.userId !== ''){
                searchuserid = {'userid': req.userId, ip: ipAddress};
            }else{
                searchuserid = {'userid': {$not: null}, ip: {$not: null}};
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
               
                Wblackliist.findOne({
                    where: searchuserid
                })
                .then(wsettings => {
                    if (!wsettings) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "IP Address Does Not Exist",
                            data: []
                        });
                    }

                    const pushUser = users.id;
                    const pushType = 'service';
                    const pushBody = 'Dear ' + users.username + ", <br />You have blacklisted a device. " +
                                    "<br /> You shall no longer login with this device again. This could also be reversed.";

                    Helpers.pushNotice(pushUser, pushBody, pushType);

                    Wblackliist.update(
                        {
                        ipmode: 1 
                        }, 
                        {
                            where : {id: wsettings.id}
                        }
                    ).then( newsettings => {

                        Wblackliist.findOne({
                            where: searchuserid
                        })
                        .then(updatedsettings => {
                            var ipmode = Helpers.returnBoolean(updatedsettings.ipmode);
                            var unboard = Helpers.returnBoolean(users.unboard);

                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Notification Settings Updated",
                                data: {
                                    blacklisted: ipmode,
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
    }
};
exports.allowsettings = (req, res, next) => {
        
    var searchuserid = [];
    var ipAddress = req.body.ipaddress;
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        if (typeof ipAddress == "undefined") {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Undefiened ipaddress field",
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

                if(req.userId && req.userId !== ''){
                    searchuserid = {'userid': req.userId, ip: ipAddress};
                }else{
                    searchuserid = {'userid': {$not: null}, ip: {$not: null}};
                }
               
                Wblackliist.findOne({
                    where: searchuserid
                })
                .then(wsettings => {
                    if (!wsettings) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "IP Address does not exist",
                            data: []
                        });
                    }

                    const pushUser = users.id;
                    const pushType = 'service';
                    const pushBody = 'Dear ' + users.username + ", <br />You have that a blacklisted device be allowed to login into your account. " +
                                    "<br /> You shall not login into your account with that device. " +
                                    "<br/> This could also be reversed.";

                    Helpers.pushNotice(pushUser, pushBody, pushType);

                    Wblackliist.update(
                        {
                            ipmode: 0
                        }, 
                        {
                            where : {id: wsettings.id}
                        }
                    ).then( newsettings => {

                         Wblackliist.findOne({
                            where: searchuserid
                        })
                        .then(updatedsettings => {
                            var unboard = Helpers.returnBoolean(users.unboard);
                            var ipmode = Helpers.returnBoolean(updatedsettings.ipmode);
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Notification Settings Updated",
                                data: {
                                    blacklisted: ipmode,
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
    }
};