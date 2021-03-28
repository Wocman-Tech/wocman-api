const pathRoot = '../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const passport = require('passport');
const cookieSession = require('cookie-session');
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
const Wsetting = db.wsetting;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const { resolve, port, website }  = require(pathRoot + "config/auth.config");

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

exports.proceedSignIn = (req, res, next) => {
    if (typeof req.email === "undefined" || req.email == null ) {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "Could not resolve google oauth",
                data: [] 
            }
        );
    }else{
        var email = req.email;
        var name = req.name;
        User.findOne({
            where: {email:email}
        }).then(user => {
            if (!user) {
                User.create({
                    username: name,
                    email: email,
                    password: bcrypt.hashSync(req.body.tokenId, 8),
                    verify_email: 1,
                    signuptype: req.body.tokenId
                })
                .then(nuser => {
                    Wsetting.findOne({
                        where: {userid: nuser.id}
                    })
                    .then(hasSettings => {
                        if (!hasSettings) {
                            Wsetting.create({
                                userid: nuser.id
                            });
                            var isDeviceSettings = false;
                            var isOTPSetings = false;
                        }else{
                            if (hasSettings.securityipa  != 0) {
                                var isDeviceSettings = true;
                            }else{
                                var isDeviceSettings = false;
                            }

                            if (hasSettings.security2fa  != 0) {
                                var isOTPSetings = true;
                            }else{
                                var isOTPSetings = false;
                            }
                        }
                        //return user data here
                        var token = jwt.sign({ id: nuser.id }, config.secret, {
                            expiresIn: 86400 // 24 hours
                        });

                        //making sure a user was signed in appropriately
                        nuser.update({
                            loginlogout:0,
                            weblogintoken:token
                        });

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Login successful",
                            data: {
                                email: nuser.email,
                                verify_email: nuser.verify_email,
                                username: nuser.username,
                                firstname: nuser.firstname,
                                lastname: nuser.lastname,
                                address: nuser.address,
                                country: nuser.country,
                                state: nuser.state,
                                province: nuser.province,
                                phone: nuser.phone,
                                image: nuser.image,
                                role: 'wocman',
                                unboard: nuser.unboard,
                                accessToken: token,
                                checkDevice: isDeviceSettings,
                                checkOTP: isOTPSetings
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
                })
                .catch(err => {
                    return res.status(500).send({
                        statusCode: 500,
                        status: false,
                        message: err.message,
                        data: []
                    });
                });
            }else{
                if (user.signuptype == 'wocman') {
                    return res.status(400).send(
                        {
                            statusCode: 400,
                            status: false, 
                            message: "User Registered Already",
                            data: [] 
                        }
                    );
                }else{
                    User.update(
                        {
                            password: bcrypt.hashSync(req.body.tokenId, 8),
                            signuptype: req.body.tokenId
                        },
                        {
                            where: {email:email}
                        }
                    );
                    //return user data here
                    var token = jwt.sign({ id: user.id }, config.secret, {
                        expiresIn: 86400 // 24 hours
                    });


                    Wsetting.findOne({
                        where: {userid: user.id}
                    })
                    .then(hasSettings => {
                        if (!hasSettings) {
                            Wsetting.create({
                                userid: user.id
                            });
                            var isDeviceSettings = false;
                            var isOTPSetings = false;
                        }else{
                            if (hasSettings.securityipa  != 0) {
                                var isDeviceSettings = true;
                            }else{
                                var isDeviceSettings = false;
                            }

                            if (hasSettings.security2fa  != 0) {
                                var isOTPSetings = true;
                            }else{
                                var isOTPSetings = false;
                            }
                        }
                        //making sure a user was signed in appropriately
                        user.update({
                            loginlogout:0,
                            weblogintoken:token
                        });

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Login successful",
                            data: {
                                email: user.email,
                                verify_email: user.verify_email,
                                username: user.username,
                                firstname: user.firstname,
                                lastname: user.lastname,
                                address: user.address,
                                country: user.country,
                                state: user.state,
                                province: user.province,
                                phone: user.phone,
                                image: user.image,
                                role: 'wocman',
                                unboard: user.unboard,
                                accessToken: token,
                                checkDevice: isDeviceSettings,
                                checkOTP: isOTPSetings
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
                }
            }
        })
        .catch(err => {
            return res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: []
            });
        });
    }
};

