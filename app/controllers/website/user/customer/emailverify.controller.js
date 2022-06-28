const pathRoot = '../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Nletter = db.Nletter;
const Contactus = db.Contactus;

const Projects = db.Projects;
const Project = db.Projecttype;
const Wshear = db.Wshear;
const WAChat = db.WaChat;
const WCChat = db.WcChat;
const WWallet = db.WWallet;

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


const Op = db.Sequelize.Op;

exports.checkVerifyEmailLinkCustomer = (req, res) => {
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
                    verify_email: 1
                },
                {
                    where: {email : users.email}
                }
            );
            var isEmailVerified = true;
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            if (isEmailVerified !== true && isEmailVerified !== false) {
                isEmailVerified = false;
            }
      
            var authorities = [];

            authorities.push("ROLE_" + "customer".toUpperCase());
            
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Email Verified",
                data: {
                    accessToken: token,
                    isEmailVerified: isEmailVerified,
                    isProfileUpdated: isProfileUpdated,
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
                    name: "Customer",
                    intro: "Welcome to Wocman Technology! We're very excited to have you on board as a customer.",
                    action: {
                        instructions: `Copy this OTP to process your registration: ${verification_link}`,
                        button: {}
                    },
                }
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
                        role: 'customer',
                        sentMail: true,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
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
