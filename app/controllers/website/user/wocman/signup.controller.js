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
const Wsetting = db.wsetting;

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
const otp = Math.floor(100000 + Math.random() * 900000);


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
    var emailLink6 = req.body.emailLink;

    const verify_email_1 = uuidv4();
    var verify_email = bcrypt.hashSync(verify_email_1, 8);
    verify_email = verify_email.replace(/[^\w\s]/gi, "");

    var Searchemail = {};
    
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
                message: "User already exist with this credentials",
                data: []
            });
        }
        User.create({
            username: 'Wocman',
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            verify_email: otp,
            signuptype: 'wocman'
        })
        .then(user => {
            UserRole.findOne({
                where: {userid: user.id}
            })
            .then(userrole => {
              if (!userrole) {
                UserRole.create({
                    userid: user.id,
                    roleid: 2
                });
              }
            });
            Wsetting.findOne({
                where: {userid: user.id}
            })
            .then(hasSettings => {
                if (!hasSettings) {
                    Wsetting.create({
                        userid: user.id
                    });
                }
            });
            
            var verification_link = otp;
            let response = {
                body: {
                  name: "Wocman",
                  intro: "Welcome to Wocman Technology! We're very excited to have you on board as a wocman. <br/ >Copy this OTP to process your registration: <div style='font-weight:bolder;'>" + verification_link + "</div>",
                },
            };

            let mail = MailGenerator.generate(response);

            let message = {
                from: EMAIL,
                to:  user.email,
                subject: "Signup Successful",
                html: mail,
            };
            var sentMail = false;
            transporter.sendMail(message)
            .then(() => {
                var sentMail = true;
            })
             res.status(200).send({
                statusCode: 200,
                status: true,
                message: "User registered successfully!",
                data: {
                    link: verification_link, 
                    email : user.email, 
                    role: 'wocman',
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