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
const Wsetting = db.Wsetting;

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


exports.signUpWocman = (req, res, next) => {

    var verifyLink = req.body.verifylink;

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
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            verify_email: otp,
            signuptype: req.body.role
        })
        .then(user => {
            Role.findOne({
                where: {name: req.body.role}
            })
            .then(role => {
                UserRole.create({
                    userid: user.id,
                    roleid: role.id
                });
            });
            Wsetting.findOne({
                where: {userid: user.id}
            })
            .then(hasSettings => {
                if (!hasSettings) {
                    Wsetting.create({
                        userid: user.id,
                        emailnotice: 1,
                        servicenotice: 1
                    });
                }
            });
            
            var verification_link = otp;
            let response = {
                body: {
                  name: "Wocman",
                  intro: "Welcome to Wocman Technology! We're very excited to have you on board as a wocman. <br/ >Copy this OTP to process your registration: <div style='font-weight:bolder;'>" + verification_link + "</div><br/><a href='"+ verifyLink +"'>Click Here to Verify</a>",
                },
            };
            let mail = MailGenerator.generate(response);

            let message = {
                from: EMAIL,
                to:  user.email,
                subject: "Signup Successful",
                html: mail,
            };
            let sentMail = false;
            transporter.sendMail(message)
            .then((data) => {
                logger.info('Signup Successful Sent Successfully', data)
                sentMail = true;
            }).catch((err) => {
                logger.error('Signup email Error', err)                
            })
             res.status(200).send({
                statusCode: 200,
                status: true,
                message: "User registered successfully!",
                data: {
                    link: verification_link, 
                    email : user.email, 
                    role: req.body.role,
                    sentMail: sentMail
                }
            });
        })
        .catch(err => {
            logger.error("singup.controller:signupWocman:CreateUser", err)
            return res.status(500).send({ 
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
       
    })
    .catch(err => {
        logger.error("singup.controller:signupWocman:FindUser", err)
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};