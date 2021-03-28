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
    var email_link =  req.params.link;

    var whereQuery = {};

    var SearchemailLink = {};
    // console.log(email_link);
    if (typeof email_link === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Email link is undefined.",
                data: []
            }
          );
    }else{

        if(email_link && email_link !== ''){
            SearchemailLink = {'verify_email': email_link};
        }else{
            SearchemailLink = {'verify_email': {$not: null}};
        }
        whereQuery = SearchemailLink;

        User.findOne({
            where: whereQuery 
        })
        .then(users => {
            if (!users) {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "Email link does not exist.",
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
    }
};


exports.resendEmail = (req, res) => {
        

    if (typeof req.body.email === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "Email field is undefined.",
                data: []
            }
        );
    }else{
       
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
            // then send the email
            //source:https://medium.com/javascript-in-plain-english/how-to-send-emails-with-node-js-1bb282f334fe
            var verification_link = emailLink6 +  user.verify_email;

            let response = {
                body: {
                  name: "Wocman",
                  intro: "Welcome to Wocman Technology! We're very excited to have you on board. Click or Copy this link to any browser to process your registration: "+verification_link,
                },
            };

            let mail = MailGenerator.generate(response);

            let message = {
                from: EMAIL,
                to:  user.email,
                subject: "Signup Successful",
                html: mail,
            };

            transporter.sendMail(message)
            .then(() => {
                 res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Email  was resent successfully!",
                    data: {
                        link: verification_link, 
                        email : user.email, 
                        role: 'wocman'
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
};
