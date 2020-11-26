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
    link: MAIN_URL,
  },
});


const Op = db.Sequelize.Op;


exports.wocmanStartResetPassword = (req, res, next) => {
    var email_link =  req.body.link;
    var password_link =  req.body.password;
    if (typeof password_link === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "password field is undefined.",
                data: [] 
            }
        );
    }
    if (password_link.length < 7 ) {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Invalid password. Minimum of 9 characters link is undefined." ,
                data: []
            }
        );
    }else{
        var password = bcrypt.hashSync(password_link, 8);
    }
    var SearchemailLink = {};
    if (typeof email_link === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "link is undefined." ,
                data: []
            }
        );
    }else{

        if(email_link && email_link !== ''){
            SearchemailLink = {'changepassword': email_link};
        }else{
            SearchemailLink = {'changepassword': {$not: null}};
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
                    message: "link does not exist.",
                    data: []
                });
            }
            users.update({
                password: password,
                changepassword: 1
            })
            .then(khj => {
                var authorities = [];

                authorities.push("ROLE_" + "admin".toUpperCase());

                var verification_link = MAIN_URL.slice(0, -1)+Helpers.apiVersion7()+"auth/admin-signin";
                let response = {
                    body: {
                      name: users.username,
                      intro: "Welcome to Wocman Technology! We're very excited to have you on board. Thank you for completing your signup. Click or Copy this link to any browser to login: "+verification_link,
                    },
                };

                let mail = MailGenerator.generate(response);

                let message = {
                    from: EMAIL,
                    to:  users.email,
                    subject: "Sign-up successful",
                    html: mail,
                };

                transporter.sendMail(message)
                .then(() => {
                })
                .catch(err => {
                });
                
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Password Reset successfully",
                    data: {
                        username: users.username,
                        email: users.email,
                        password: users.password,
                        changepassword: users.changepassword,
                        roles: authorities
                    }
                });
            })
            .catch(err => {
                res.status(500).send({
                    statusCode: 500,
                    status: false, 
                    message: err.message,
                    data: [] 
                });
            });
        })
        .catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        }); 
    }
};