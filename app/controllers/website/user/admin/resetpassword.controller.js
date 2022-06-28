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


exports.adminStartResetPassword = (req, res, next) => {
    var email_link =  req.body.email;
    var password_link =  req.body.password;
    var password_otplink =  req.body.otpToken;
    
    var password = bcrypt.hashSync(password_link, 8);
    
    var SearchemailLink = {};
   

    if(email_link && email_link !== ''){
        SearchemailLink = {'email': email_link, 'changepassword': password_otplink};
    }else{
        SearchemailLink = {'email':  {$not: null}, 'changepassword': {$not: null}};
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
                message: "Password reset link does not exist.",
                data: []
            });
        }
        
        users.update({
            password: password,
            changepassword: 1
        })
        .then(khj => {
            var sentMail = false;

            var authorities = [];

            authorities.push("ROLE_" + "admin".toUpperCase());

            var verification_link = config.website + "/login?admin=1";
            let response = {
                body: {
                    name: users.username,
                    intro: "Welcome to Wocman Technology! We're very excited to have you on board.",
                    action: {
                        instructions: `Your password reset process was Completed. Click or Copy this link below to any browser to login`,
                        button: {
                            color: '#22BC66', // Optional action button color
                            text: 'Click Here to Login',
                            link: verification_link
                        }
                    },
                }
            };

            let mail = MailGenerator.generate(response);

            let message = {
                from: EMAIL,
                to:  users.email,
                subject: "Password Reset successful",
                html: mail,
            };

            transporter.sendMail(message)
            .then(() => {
                var sentMail = true;
            })
            if (users.changepassword == 1) {
                var changepassword = "Completed";
            }
            if (users.changepassword.length == 6) {
                var changepassword = "In progress";
            }
            if (users.changepassword == 0) {
                var changepassword = "Not Started";
            }
            var unboard = Helpers.returnBoolean(users.unboard);
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            
            if (isEmailVerified !== true && isEmailVerified !== false) {
                isEmailVerified = false;
            }

            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Password Reset successful",
                data: {
                    username: users.username,
                    email: users.email,
                    changepassword: changepassword,
                    roles: authorities,
                    sentMail: sentMail,
                    isEmailVerified: isEmailVerified,
                    isProfileUpdated: isProfileUpdated,
                    unboard: unboard
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
};