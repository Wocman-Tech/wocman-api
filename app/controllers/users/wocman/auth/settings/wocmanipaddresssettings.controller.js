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
    

    if (parseInt(req.userId, 10) < 1) {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        if(req.userId && req.userId !== ''){
            Searchuserid = {'userid': req.userId};
        }else{
            Searchuserid = {'userid': {$not: null}};
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
           
            Wsetting.findOne({
                where: Searchuserid
            })
            .then(wsettings => {
                if (!wsettings || !wsettings.length>0) {

                    Wsetting.create({
                        userid: req.userId,
                        securityipa: 1 
                    }).then( newsettings => {

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                settings: newsettings,
                                AccessToken: req.token,
                                Unboard: users.unboard
                            }
                        });
                    }) 
                    
                    
                }else{
                    Wsetting.update(
                        {
                        securityipa: 1 
                        }, 
                        {
                            where : {id: wsettings.id}
                        }
                    ).then( newsettings => {

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                settings: newsettings,
                                AccessToken: req.token,
                                Unboard: users.unboard
                            }
                        });
                    })
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
exports.nwipsettings = (req, res, next) => {
    

    if (parseInt(req.userId, 10) < 1) {
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

            if(req.userId && req.userId !== ''){
                searchuserid = {'userid': req.userId};
            }else{
                searchuserid = {'userid': {$not: null}};
            }
           
            Wsetting.findOne({
                where: searchuserid
            })
            .then(wsettings => {

                Wsetting.update(
                    {
                        securityipa: 0
                    }, 
                    {
                        where : {id: wsettings.id}
                    }
                ).then( newsettings => {

                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Notification Settings Updated",
                        data: {
                            settings: wsettings,
                            AccessToken: req.token,
                            Unboard: users.unboard
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