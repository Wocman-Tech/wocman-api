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
const IpBlacklist = db.ipblacklist;

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



const schemaJoiIP = Joi.object({
    ipaddress: Joi.string().min(10).required()
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
        var password = req.password;

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

                    User.findOne({
                        where: {email:email}
                    }).then(xnewuser => {
                        var sentMail = false;

                        //create Settings
                        Wsetting.create({
                            userid: xnewuser.id
                        }).then(gf6 => {

                            Wsetting.findOne({

                                where: {userid: xnewuser.id}
                            })
                            .then(hasSettings => {
                                if (parseInt(hasSettings.securityipa, 10) == 0) {
                                    if (parseInt(hasSettings.security2fa, 10) == 0) {
                                        //return user data here
                                        var token = jwt.sign({ id: xnewuser.id }, config.secret, {
                                            expiresIn: 86400 // 24 hours
                                        });

                                        //making sure a user was signed in appropriately
                                        nuser.update({
                                            loginlogout:0,
                                            weblogintoken:token
                                        });
                                        var unboard = Helpers.returnBoolean(xnewuser.unboard);
                                        var isEmailVerified = Helpers.returnBoolean(xnewuser.verify_email);
                                        var isProfileUpdated = Helpers.returnBoolean(xnewuser.profileupdate);
                                        var isCertificateUploaded = Helpers.returnBoolean(xnewuser.certificatesupdate);
                                        var isSkilled = Helpers.returnBoolean(xnewuser.isSkilled);



                                        res.status(200).send({
                                            statusCode: 200,
                                            status: true,
                                            message: "Login successful",
                                            isdevice: false,
                                            isOtp: false,
                                            data: {
                                                email: xnewuser.email,
                                                verify_email: xnewuser.verify_email,
                                                username: xnewuser.username,
                                                firstname: xnewuser.firstname,
                                                lastname: xnewuser.lastname,
                                                address: xnewuser.address,
                                                country: xnewuser.country,
                                                state: xnewuser.state,
                                                province: xnewuser.province,
                                                phone: xnewuser.phone,
                                                image: xnewuser.image,
                                                role: 'wocman',
                                                accessToken: token,
                                                isEmailVerified: isEmailVerified,
                                                isProfileUpdated: isProfileUpdated,
                                                isCertificateUploaded: isCertificateUploaded,
                                                isSkilled: isSkilled,
                                                unboard: unboard
                                            }
                                        });
                                    }else{

                                        const otp = Math.floor(100000 + Math.random() * 900000);

                                        let response = {
                                            body: {
                                              name: xnewuser.username,
                                              intro: "Welcome to Wocman Technology! You requested an OTP to login. Copy this OTP  to continue   Login: <br /><div style='font-weight:bolder;'>" + otp + "</div><br/>",
                                            },
                                        };

                                        let mail = MailGenerator.generate(response);

                                        let message = {
                                            from: EMAIL,
                                            to:  xnewuser.email,
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
                                                where: {id: xnewuser.id}
                                            }
                                        );
                                        return res.status(200).send({
                                            statusCode: 200,
                                            status: true,
                                            isotp: true,
                                            message: 'An OTP Was Sent',
                                            data: {
                                                opt: otp,
                                                email: email,
                                                password: password,
                                                sentMail: sentMail
                                            }
                                        });
                                    }
                                }else{
                                    const otp = Math.floor(100000 + Math.random() * 900000);

                                    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                                            req.connection.remoteAddress || 
                                            req.socket.remoteAddress || 
                                            req.connection.socket.remoteAddress

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
                                            where: {ip: ip, userid: xnewuser.id}
                                        }).then(findip => {
                                            if (!findip) {//assuming the ip addres does not exit before now
                                                IpBlacklist.create({//we create it
                                                    ip: ip,
                                                    ipmode: 0,
                                                    ipotp: otp,
                                                    userid: xnewuser.id
                                                })
                                            }else{
                                                IpBlacklist.update(
                                                    {
                                                        ipotp: otp
                                                    },
                                                    {
                                                        where: {ip: ip, userid: xnewuser.id }
                                                    }
                                                )
                                                IpBlacklist.findOne({
                                                    where: {ip: ip, userid: xnewuser.id}
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
                                                  name: xnewuser.username,
                                                  intro: "Welcome to Wocman Technology! You are trying to login into your account from another device. Copy this OTP  to continue  Login: <br /><div style='font-weight:bolder;'>" + otp + "</div><br />",
                                                },
                                            };

                                            let mail = MailGenerator.generate(response);

                                            let message = {
                                                from: EMAIL,
                                                to:  xnewuser.email,
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
                                                    email: email,
                                                    password: password,
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
                var sentMail = false;

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
                    //pasted here
                    Wsetting.findOne({
                        where: {userid: user.id}
                    })
                    .then(hasSettings => {
                        if (parseInt(hasSettings.securityipa, 10) == 0) {
                            if (parseInt(hasSettings.security2fa, 10) == 0) {
                                //return user data here
                                var token = jwt.sign({ id: user.id }, config.secret, {
                                    expiresIn: 86400 // 24 hours
                                });

                                //making sure a user was signed in appropriately
                                User.update(
                                    {
                                        loginlogout:0,
                                        weblogintoken:token
                                    },
                                    {
                                        where: {email:email}
                                    }
                                );
                                var unboard = Helpers.returnBoolean(user.unboard);
                                var isEmailVerified = Helpers.returnBoolean(user.verify_email);
                                var isProfileUpdated = Helpers.returnBoolean(user.profileupdate);
                                var isCertificateUploaded = Helpers.returnBoolean(user.certificatesupdate);
                                var isSkilled = Helpers.returnBoolean(user.isSkilled);




                                res.status(200).send({
                                    statusCode: 200,
                                    status: true,
                                    message: "Login successful",
                                    isdevice: false,
                                    isOtp: false,
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
                                        accessToken: token,
                                        isEmailVerified: isEmailVerified,
                                        isProfileUpdated: isProfileUpdated,
                                        isCertificateUploaded: isCertificateUploaded,
                                        isSkilled: isSkilled,
                                        unboard: unboard
                                    }
                                });
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
                                        opt: otp,
                                        email: email,
                                        password: password,
                                        sentMail: sentMail
                                    }
                                });
                            }
                        }else{
                            const otp = Math.floor(100000 + Math.random() * 900000);

                            var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                                    req.connection.remoteAddress || 
                                    req.socket.remoteAddress || 
                                    req.connection.socket.remoteAddress

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
                                          name: user.username,
                                          intro: "Welcome to Wocman Technology! You are trying to login into your account from another device. Copy this OTP  to continue  Login: <br /><div style='font-weight:bolder;'>" + otp + "</div><br />",
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
                                            email: email,
                                            password: password,
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