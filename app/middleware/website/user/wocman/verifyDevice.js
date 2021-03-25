
const baseUrl = "../../../../";

const db = require(baseUrl+"models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Wsetting = db.wsetting;
const IpBlacklist = db.ipblacklist;
const config = require(baseUrl+"config/auth.config");


const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');
const {v4 : uuidv4} = require('uuid');

const { EMAIL, PASSWORD, MAIN_URL } = require(baseUrl+"helpers/helper.js");

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

const schemaJoiIP = Joi.object({
    ipaddress: Joi.string().min(10).required()
});

exports.isDevice = (req, res, next) => {
    var searchemail = {};
    if(req.body.email && req.body.email !== ''){
        searchemail = {'email': req.body.email}
    }else{
        searchemail = {'email': {$not: null}};
    }

    User.findOne({
        where: searchemail
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                date: []
            });
        }
        var searchuser = {'userid': user.id};

        Wsetting.findOne({
            where: searchuser
        })
        .then(hasSettings => {
            if (!hasSettings) {
                Wsetting.create({
                    userid: user.id
                });
            }
            Wsetting.findOne({
                where: searchuser
            })
            .then(usersettings => {
                if (!usersettings) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User Settings not found.",
                        date: []
                    });
                }

                if (usersettings.securityipa != 0) {

                    if (typeof req.body.ipaddress === "undefined") {
                        return res.status(400).send(
                            {
                                statusCode: 400,
                                status: false, 
                                message: "IP Address is undefined.",
                                data: []
                            }
                        );
                    }else{
                        var ip = req.body.ipaddress;

                        var joyresult = schemaJoiIP.validate({ ipaddress: ip });
                        var { value, error } = joyresult;
                        if (!(typeof error === 'undefined')) {
                            var msg = Helpers.getJsondata(error, 'details')[0];
                            var msgs = Helpers.getJsondata(msg, 'message');
                            return res.status(422).json({
                                statusCode: 422,
                                status: false,
                                message: msgs,
                                data: []
                            })
                        }else{

                            IpBlacklist.findOne({
                                where: {ip: ip, userid: user.id}
                            }).then(findip => {
                                if (!findip) {

                                    if (usersettings.securityipa != ip) {
                                        if (typeof req.body.emailLink === "undefined") {
                                            return res.status(400).send(
                                                {
                                                    statusCode: 400,
                                                    status: false,
                                                    message: "Include an emailLink that would be sent to user email",
                                                    data: [] 
                                                }
                                            );
                                        }else{
                                            var resrt6d = req.body.emailLink.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
                                            if (resrt6d == null) {
                                                return res.status(422).json({
                                                    statusCode: 422,
                                                    status: false,
                                                    message: 'Invalid Email Link',
                                                    data: []
                                                })
                                            }else{
                                                var verify_ip_ad = uuidv4();
                                                verify_ip_ad = verify_ip_ad + 'b9fdH' + ip;
                                                
                                                var verification_link = req.body.emailLink + verify_ip_ad;
                                                var verification_link_2 = req.body.emailLink + verify_ip_ad;
                                                let response = {
                                                    body: {
                                                      name: user.firstname + " " + user.lastname,
                                                      intro: "Welcome to Wocman Technology! You are trying to login into your account from another device. Click or Copy this link to any browser to processed  in Login: " + verification_link + "<br /> If it is not you, kindly click on this link to cancel login: " + verification_link_2,
                                                    },
                                                };

                                                let mail = MailGenerator.generate(response);

                                                let message = {
                                                    from: EMAIL,
                                                    to:  user.email,
                                                    subject: "Securiy Concern: Device Verification",
                                                    html: mail,
                                                };

                                                transporter.sendMail(message)
                                                .then(  sentMail => {
                                                    user.update({
                                                        webloginipa: verify_ip_ad
                                                    }).then( updatedUser => {
                                                        return res.status(202).send({
                                                            statusCode: 202,
                                                            status: true,
                                                            accessToken: null,
                                                            message: "A message was sent to you to verify you are logging into your account from another device",
                                                            data: {
                                                                accept: verification_link,
                                                                reject: verification_link_2
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
                                            }
                                        }
                                    }else{ next(); }
                                }else{
                                    return res.status(401).send({
                                        statusCode: 401,
                                        status: false,
                                        accessToken: null,
                                        message: "Device has been blacklisted",
                                        data: []
                                    });
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
                    }
                }else{
                    next(); 
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
};

