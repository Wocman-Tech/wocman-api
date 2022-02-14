
const baseUrl = "../../../../";

const db = require(baseUrl+"models");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Nletter = db.Nletter;
const Contactus = db.Contactus;

const Wsetting = db.Wsetting;
const IpBlacklist = db.Ipblacklist;
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



const Op = db.Sequelize.Op;


const { resolve, port, website, name, otpId }  = require(baseUrl + "config/auth.config.js");

const schemaJoiOTP = Joi.object({
    otpToken: Joi.number().min(100000).required()
});

const messagebird = require('messagebird')(otpId);

exports.isCustomer2FASMS = (req, res, next) => {

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

                if (usersettings.security2fa != 0) {
                    const otp = Math.floor(100000 + Math.random() * 900000);


                    var messageParams = {
                      'originator': 'MessageBird',
                      'recipients': [
                        user.phone
                    ],
                      'body': otp + ' is your ' + name + ' verification code'
                    };

                    messagebird.messages.create(messageParams, function (err, response) {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log(response);
                    });
                    User.update(
                        {
                            weblogin2fa: otp
                        },
                        {
                            where: {id: user.id}
                        }
                    );
                    return res.status(200).send({
                        statusCode: 200,
                        status: true, 
                        message: 'An OTP Was Sent',
                        data: {
                            opt: otp
                        } 
                    });
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
exports.resendisCustomer2FASMS = (req, res, next) => {

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

                if (usersettings.security2fa != 0) {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    

                    var messageParams = {
                      'originator': 'MessageBird',
                      'recipients': [
                        user.phone
                    ],
                      'body': otp + ' is your ' + name + ' verification code'
                    };

                    messagebird.messages.create(messageParams, function (err, response) {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log(response);
                    });
                    User.update(
                        {
                            weblogin2fa: otp
                        },
                        {
                            where: {id: user.id}
                        }
                    );
                    return res.status(200).send({
                        statusCode: 200,
                        status: true, 
                        message: 'An OTP Was Sent',
                        data: {
                            otp: otp
                        }
                    });
                }else{
                    return res.status(404).send({
                        statusCode: 404,
                        status: false, 
                        message: 'User Settings does not include OTP',
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


exports.isCustomer2FA = (req, res, next) => {
    var sentMail = false;

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
        .then(usersettings => {
            if (!usersettings) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Settings not found.",
                    date: []
                });
            }

            if (parseInt(usersettings.security2fa, 10) == 0) {
                next();
            }else{

                const otp = Math.floor(100000 + Math.random() * 900000);

                let response = {
                    body: {
                      name: user.username,
                      intro: "Welcome to Wocman Technology! You requested an OTP to login. Copy this OTP  to continue   Login: <br /><div style='font-weight:bolder;'>" + otp + "</div><br/>",
                    },
                };

                let mail = MailGenerator.generate(response);

                let message = {
                    from: EMAIL,
                    to:  user.email,
                    subject: "Securiy Concern: Login Verification",
                    html: mail,
                };

                transporter.sendMail(message)
                .then(  sentMails => {
                    var sentMail = true;
                })
                User.update(
                    {
                        weblogin2fa: otp
                    },
                    {
                        where: {id: user.id}
                    }
                );
                return res.status(200).send({
                    statusCode: 200,
                    status: true,
                    isotp: true,
                    message: 'An OTP Was Sent',
                    data: {
                        otp: otp,
                        email: user.email,
                        password: user.password,
                        sentMail: sentMail
                    }
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
exports.resendIsCustomer2FA = (req, res) => {
    var sentMail = false;
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
        .then(usersettings => {
            if (!usersettings) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Settings not found.",
                    date: []
                });
            }

            if (parseInt(usersettings.security2fa, 10) == 0) {
                return res.status(422).json({
                    statusCode: 422,
                    status: false,
                    message: 'User does not have Login OTP settings',
                    data: []
                })
            }else{

                const otp = Math.floor(100000 + Math.random() * 900000);

                let response = {
                    body: {
                      name: user.username,
                      intro: "Welcome to Wocman Technology! You requested an OTP to login. Copy this OTP  to continue   Login: <br /><div style='font-weight:bolder;'>" + otp + "</div><br/>",
                    },
                };

                let mail = MailGenerator.generate(response);

                let message = {
                    from: EMAIL,
                    to:  user.email,
                    subject: "Securiy Concern: Login Verification",
                    html: mail,
                };

                transporter.sendMail(message)
                .then(  sentMails => {
                    var sentMail = true;
                })
                User.update(
                    {
                        weblogin2fa: otp
                    },
                    {
                        where: {id: user.id}
                    }
                );
                return res.status(200).send({
                    statusCode: 200,
                    status: true,
                    isotp: true,
                    message: 'An OTP Was Sent',
                    data: {
                        otp: otp,
                        email: user.email,
                        password: user.password,
                        sentMail: sentMail
                    }
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
exports.activateIsCustomer2FA = (req, res) => {
    var email = req.body.email;
    var otpToken = req.body.otpToken;
    var password = req.body.password;

    var joyresult = schemaJoiOTP.validate({ otpToken: otpToken });
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
        var searchemail = {};

        if(email && email !== ''){
            searchemail = {'email': email}
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
            if (user.weblogin2fa != otpToken) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Token Not found.",
                    date: []
                });
            }

            var passwordIsValid = bcrypt.compareSync(
                password,
                user.password
            );
            if (!passwordIsValid) {
                return res.status(401).send({
                    statusCode: 401,
                    status: false,
                    accessToken: null,
                    message: "Invalid Password!",
                    data: []
                });
            }else{

                var token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: 86400 // 24 hours
                });
                var isEmailVerified = Helpers.returnBoolean(user.verify_email);
                var isProfileUpdated = Helpers.returnBoolean(user.profileupdate);
                var isCertificateUploaded = Helpers.returnBoolean(user.certificatesupdate);
                var unboard = Helpers.returnBoolean(user.unboard);
                var isSkilled = Helpers.returnBoolean(user.isSkilled);
                if (isEmailVerified !== true && isEmailVerified !== false) {
                    isEmailVerified = false;
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
                    isotp: false,
                    data: {
                        email: user.email,
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        address: user.address,
                        country: user.country,
                        state: user.state,
                        province: user.province,
                        phone: user.phone,
                        image: user.image,
                        role: 'customer',
                        accessToken: token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
                        isCertificateUploaded: isCertificateUploaded,
                        isSkilled: isSkilled,
                        unboard: unboard
                    }
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
};