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
        SearchemailLink = {'verify_email': otp, 'email': email_link};
    }else{
        SearchemailLink = {'verify_email': {$not: null},  'email': {$not: null}};
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
                message: "user not exist",
                data: []
            });
        }
        User.update(
            {
                verify_email: 1
            },
            {
                where: {email : users.email}
            }
        );
  
        var token = jwt.sign({ id: users.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });

        var authorities = [];

        authorities.push("ROLE_" + "wocman".toUpperCase());
        
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Link available",
            data: {
                accessToken: token
            }
        });
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
            var unboard = Helpers.returnBoolean(user.unboard);

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
