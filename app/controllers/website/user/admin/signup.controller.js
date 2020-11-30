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


exports.signUpWocman = (req, res, next) => {
    if (typeof req.body.username === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "Username field is undefined.",
                data: []
            }
        );
    }else{

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

            if (typeof req.body.password === "undefined") {
                return res.status(400).send(
                    {
                        statusCode: 400,
                        status: false,
                        message: "Password field is undefined.",
                        data: [] 
                    }
                );
            }else{

                if (typeof req.body.repeat_password === "undefined") {
                    return res.status(400).send(
                        {
                            statusCode: 400,
                            status: false,
                            message: "Repeat Password field is undefined.",
                            data: [] 
                        }
                    );
                }else{

                

                    const verify_email_1 = uuidv4();
                    var verify_email = bcrypt.hashSync(verify_email_1, 8);
                    verify_email = verify_email.replace(/[^\w\s]/gi, "");

                    var  SearchUsername = {};
                    var Searchemail = {};
                    var whereQuery = {};
                    var userId = {};
                    if(req.body.username && req.body.username !== ''){
                        SearchUsername = {'username': req.body.username};
                    }else{
                        SearchUsername = {'username': {$not: null}};
                    }
                    if(req.body.email && req.body.email !== ''){
                        Searchemail = {'email': req.body.email}
                    }else{
                        Searchemail = {'email': {$not: null}};
                    }

                    User.findOne({
                      where: Searchemail 
                    })
                    .then(dfg43 => {
                        if (dfg43) {
                            return res.status(404).send(
                            { 
                                statusCode: 404,
                                status: false,
                                message: "Email already exist",
                                data: []
                            });
                        }
                        User.findOne({
                          where: SearchUsername 
                        })
                        .then(uytyt7 => {
                            if (uytyt7) {
                                return res.status(404).send(
                                { 
                                    statusCode: 404,
                                    status: false,
                                    message: "Username already exist",
                                    data: []
                                });
                            }
                            User.create({
                                username: req.body.username,
                                email: req.body.email,
                                password: bcrypt.hashSync(req.body.password, 8),
                                verify_email: verify_email
                            })
                            .then(user => {

                                if(user.id && user.id !== ''){
                                    userId = {'userid': user.id}
                                }else{
                                    userId = {'userid': {$not: null}};
                                }
                                whereQuery = userId;

                                UserRole.findOne({
                                    where: whereQuery
                                })
                                .then(userrole => {
                                  if (!userrole) {
                                    UserRole.create({
                                        userid: user.id,
                                        roleid: 1
                                    });
                                  }
                                });
                                // then send the email
                                //source:https://medium.com/javascript-in-plain-english/how-to-send-emails-with-node-js-1bb282f334fe
                                var verification_link = MAIN_URL.slice(0, -1)+Helpers.apiVersion7()+"admin-signup-verification/"+ user.verify_email;
                                let response = {
                                    body: {
                                      name: req.body.username,
                                      intro: "Welcome to Wocman Technology! We're very excited to have you on board. Click or Copy this link to any browser to process your registration: "+verification_link,
                                    },
                                };

                                let mail = MailGenerator.generate(response);

                                let message = {
                                    from: EMAIL,
                                    to:  user.email,
                                    subject: "signup successful",
                                    html: mail,
                                };

                                transporter.sendMail(message)
                                .then(() => {
                                     res.status(200).send({
                                        statusCode: 200,
                                        status: true,
                                        message: "User registered successfully!",
                                        data: {
                                            link: verification_link, 
                                            email : user.email, 
                                            role: 'admin'
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
        }
    }
};