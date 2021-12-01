const pathRoot = '../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
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

exports.checkVerifyEmailLinkWocman = (req, res) => {
    var email_link =  req.body.email;
    var otp =  req.body.otpToken;
    var SearchemailLink = {};

    if(email_link && email_link !== ''){
        SearchemailLink = {'email': email_link};
    }else{
        SearchemailLink = {'email': {$not: null}};
    }

    User.findOne({
        where: SearchemailLink 
    })
    .then(users => {
        if (!users) {
            return res.status(404).send(
            {
                statusCode: 404,
                status: false,
                message: "User not Found",
                data: []
            });
        }
        var token = jwt.sign({ id: users.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });
        var isProfileUpdated1 = Helpers.returnBoolean(users.profileupdate);
        var isCertificateUploaded1 = Helpers.returnBoolean(users.certificatesupdate);
        var isSkilled1 = Helpers.returnBoolean(users.isSkilled);
        var unboard1 = Helpers.returnBoolean(users.unboard);
        var isEmailVerified1 = Helpers.returnBoolean(users.verify_email);

        if (isEmailVerified1 == true) {
            return res.status(200).send(
            {
                statusCode: 200,
                status: true,
                message: "Email Already Verified",
                data: {
                    accessToken: token,
                    isEmailVerified: isEmailVerified1,
                    isProfileUpdated: isProfileUpdated1,
                    isCertificateUploaded: isCertificateUploaded1,
                    isSkilled: isSkilled1,
                    unboard: unboard1
                }
            });
        }else{
            if (users.verify_email !== otp) {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "Invalid OTP Token",
                    data: []
                });
            }

            User.update(
                {
                    verify_email: 1,
                    loginlogout:0,
                    weblogintoken:token
                },
                {
                    where: {email : users.email}
                }
            );
            
            var isEmailVerified = true;
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var isCertificateUploaded = Helpers.returnBoolean(users.certificatesupdate);
            var isSkilled = Helpers.returnBoolean(users.isSkilled);
            var unboard = Helpers.returnBoolean(users.unboard);

            if (isEmailVerified !== true && isEmailVerified !== false) {
                isEmailVerified = false;
            }
      
            var authorities = [];

            authorities.push("ROLE_" + "wocman".toUpperCase());
            
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Email Verified",
                data: {
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
        return  res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    }); 
};


exports.resendEmail = (req, res) => {
    const otpValue = Math.floor(100000 + Math.random() * 900000);

    var Searchemail = {};
    
    if(req.body.email && req.body.email !== ''){
        Searchemail = {'email': req.body.email}
    }else{
        Searchemail = {'email': {$not: null}};
    }

    User.findOne({
      where: Searchemail 
    })
    .then(user => {
        if (!user) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "Email does not exist",
                data: []
            });
        }
        if (user.verify_email == 1) {
            return res.status(404).send(
            { 
                statusCode: 404,
                status: false,
                message: "Signup Has been verified, please login",
                data: []
            });
        }
        User.update(
            {
                verify_email: otpValue
            },
            {
                where: {email: user.email}
            }
        )
        .then( emailSent => {

            var verification_link = otpValue;

            let response = {
                body: {
                    name: "Wocman",
                    intro: "Welcome to Wocman Technology! We're very excited to have you on board as a wocman. <br/ >Copy this OTP to process your registration: <div style='font-weight:bolder;'>" + verification_link + "</div><br/>",
                },
            };

            let mail = MailGenerator.generate(response);

            let message = {
                from: EMAIL,
                to:  user.email,
                subject: "Signup Verification Resent Successful",
                html: mail,
            };

            var isEmailVerified = Helpers.returnBoolean(user.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(user.profileupdate);
            var isCertificateUploaded = Helpers.returnBoolean(user.certificatesupdate);
            var isSkilled = Helpers.returnBoolean(user.isSkilled);
            var unboard = Helpers.returnBoolean(user.unboard);

            if (isEmailVerified !== true && isEmailVerified !== false) {
                isEmailVerified = false;
            }

            transporter.sendMail(message)
            .then(() => {
                 res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Email  was resent successfully!",
                    data: {
                        link: verification_link, 
                        email : user.email, 
                        role: 'wocman',
                        sentMail: true,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
                        isCertificateUploaded: isCertificateUploaded,
                        isSkilled: isSkilled,
                        unboard: unboard
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
