
const baseUrl = "../../../../";

const db = require('../../../../models');
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
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
    host: config.message_server,
    port: 465,
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

const schemaJoiLink = Joi.object({
    links: Joi.string().min(10).required()
});

const Op = db.Sequelize.Op;

const otp = Math.floor(100000 + Math.random() * 900000);

exports.isDevice = (req, res, next) => {
    var email = req.body.email;
    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress

    // console.log(ip);
    // next();

    if (typeof ip === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "IP Address is undefined.",
                data: []
            }
        );
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
            const username = user.username;

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
                    if (parseInt(usersettings.securityipa, 10) == 0) {
                        next();
                    }else{
                            IpBlacklist.findOne({
                                where: {ip: ip, userid: user.id}
                            }).then(findip => {
                                if (!findip) {//assuming the ip addres does not exit before now
                                    IpBlacklist.create({//we create it
                                        ip: ip,
                                        ipmode: 0,
                                        ipotp: otp,
                                        userid: user.id
                                    })
                                }else{
                                    IpBlacklist.update(
                                        {
                                            ipotp: otp
                                        },
                                        {
                                            where: {ip: ip, userid: user.id }
                                        }
                                    )
                                    IpBlacklist.findOne({
                                        where: {ip: ip, userid: user.id}
                                    }).then(newfinhd5ip => {//we sent the opt to the users email
                                        // console.log(newfinhd5ip.ipmode);

                                        if (parseInt(newfinhd5ip.ipmode, 10) == 1) {
                                            return res.status(401).send({
                                                statusCode: 401,
                                                status: false,
                                                accessToken: null,
                                                message: "IP Addres was blacklisted",
                                                data: []
                                            });
                                        }
                                    })
                                }
                                var sentMail = false;
                                let response = {
                                    body: {
                                        name: username,
                                        intro: "Welcome to Wocman Technology! You are trying to login into your account from another device.",
                                        action: {
                                            instructions: `Copy this OTP to continue Login: ${otp}`,
                                            button: {}
                                        },
                                    }
                                };

                                let mail = MailGenerator.generate(response);

                                let message = {
                                    from: EMAIL,
                                    to:  user.email,
                                    subject: "Securiy Concern: Device Verification",
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
                                return res.status(202).send({//return response
                                    statusCode: 202,
                                    status: true,
                                    accessToken: null,
                                    isdevice: true,
                                    message: "You are logging into your account from another device",
                                    data: {
                                        otp: otp,
                                        email: user.email,
                                        password: user.password,
                                        sentMail: sentMail
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
    }
};
exports.resendIsDevice = (req, res) => {    
    var email = req.body.email;
    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress
    // console.log(ip);

    if (typeof ip === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "IP Address is undefined.",
                data: []
            }
        );
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
            const username = user.username;
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
                    if (parseInt(usersettings.securityipa, 10) == 0) {
                        return res.status(422).json({
                            statusCode: 422,
                            status: false,
                            message: 'User does not have device settings',
                            data: []
                        })
                    }else{
                            IpBlacklist.findOne({
                                where: {ip: ip, userid: user.id}
                            }).then(findip => {
                                if (!findip) {//assuming the ip addres does not exit before now
                                    IpBlacklist.create({//we create it
                                        ip: ip,
                                        ipmode: 0,
                                        ipotp: otp,
                                        userid: user.id
                                    })
                                }else{

                                    IpBlacklist.update(
                                        {
                                            ipotp: otp
                                        },
                                        {
                                            where: {ip: ip, userid: user.id }
                                        }
                                    )
                                    IpBlacklist.findOne({
                                        where: {ip: ip, userid: user.id}
                                    }).then(newfindip => {//we sent the opt to the users email
                                        if (parseInt(newfindip.ipmode, 10) == 1) {
                                            return res.status(401).send({
                                                statusCode: 401,
                                                status: false,
                                                accessToken: null,
                                                message: "IP Addres was blacklisted",
                                                data: []
                                            });
                                        }
                                    });
                                }

                                var sentMail = false;

                                let response = {
                                    body: {
                                        name: username,
                                        intro: "Welcome to Wocman Technology! You are trying to login into your account from another device.",
                                        action: {
                                            instructions: `Copy this OTP to continue Login: ${otp}`,
                                            button: {}
                                        },
                                    }
                                };

                                let mail = MailGenerator.generate(response);

                                let message = {
                                    from: EMAIL,
                                    to:  user.email,
                                    subject: "Securiy Concern: Device Verification",
                                    html: mail,
                                };

                                transporter.sendMail(message)
                                .then(  sentMails => {
                                    var sentMail = true;
                                })
                                return res.status(202).send({//return response
                                    statusCode: 202,
                                    status: true,
                                    accessToken: null,
                                    isdevice: true,
                                    message: "You are logging into your account from another device",
                                    data: {
                                        otp: otp,
                                        email: user.email,
                                        password: user.password,
                                        sentMail: sentMail
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
    }
};
exports.activateIsDevice = (req, res) => {
    var email = req.body.email;
    var otpToken = req.body.otpToken;
    var password = req.body.password;
    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress
    if (typeof ip === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "IP Address is undefined.",
                data: []
            }
        );
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
                

                var searchuser = {'userid': user.id};
                IpBlacklist.findOne({
                    where: {ip: ip, userid: user.id, ipotp: otpToken}
                }).then(newfindip => {
                    if (!newfindip) {
                        return res.status(400).send({
                            statusCode: 400,
                            status: false,
                            accessToken: null,
                            message: "Invalid Token",
                            data: []
                        });
                    }
                    if (newfindip.ipmode == 1) {
                        return res.status(401).send({
                            statusCode: 401,
                            status: false,
                            accessToken: null,
                            message: "IP Addres was blacklisted",
                            data: []
                        });
                    }
                    //we check the password and continue login
                    //destroy the token
                    IpBlacklist.update(
                        {
                            ipotp: 0
                        },
                        {
                            where: {ip: ip, userid: user.id, ipotp: otpToken}
                        }
                    )
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
                            isdevice: false,
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
                                role: 'wocman',
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