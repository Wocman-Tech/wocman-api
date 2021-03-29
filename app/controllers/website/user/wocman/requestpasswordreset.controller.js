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
const otp = Math.floor(100000 + Math.random() * 900000);
exports.wocmanResetPassword = (req, res, next) => {
    
    const verify_email = otp;
    var  SearchUsername = {};
    var Searchemail = {};
    var whereQuery = {};
    var userId = {};
   
    if(req.body.email && req.body.email !== ''){
        Searchemail = {'email': req.body.email}
    }else{
        Searchemail = {'email': {$not: null}};
    }

    User.findOne({
      where: Searchemail 
    })
    .then(dfg43 => {
        if (!dfg43) {
            return res.status(404).send(
            {
                statusCode: 404,
                status: false,
                message: "Email does not  exist",
                data: []
            });
        }else{

            dfg43.update({
                changepassword: verify_email
            })
            .then(tht => {
                let response = {
                    body: {
                      name: dfg43.username,
                      intro: "You have requested that your password be changed. If not you, kindly disregard this message.  <br/>Copy this digits to complete the password reset process: <br><div style='font-weight:bolder;'>" + verify_email+"</div><br/>",
                    },
                };
                var sentMail = false;


                let mail = MailGenerator.generate(response);

                let message = {
                    from: EMAIL,
                    to:  dfg43.email,
                    subject: "Password Reset Request",
                    html: mail,
                };

                transporter.sendMail(message)
                .then(() => {
                    var sentMail = true;
                })
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Password Reset Request", 
                    data: {
                        link: otp, 
                        email : dfg43.email, 
                        role: 'wocman',
                        sentMail: sentMail
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
        }
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