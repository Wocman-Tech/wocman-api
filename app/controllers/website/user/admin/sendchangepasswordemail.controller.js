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

exports.wocmanResetPassword = (req, res, next) => {
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
        const verify_email_1 = uuidv4();
        var verify_email = bcrypt.hashSync(verify_email_1, 8);
        verify_email = verify_email.replace(/[^\w\s]/gi, "");

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
                    // console.log("yes");
                    //source:https://medium.com/javascript-in-plain-english/how-to-send-emails-with-node-js-1bb282f334fe
                    var verification_link = MAIN_URL.slice(0, -1)+Helpers.apiVersion7()+"admin-password-reset/" + dfg43.changepassword;
                    let response = {
                        body: {
                          name: dfg43.username,
                          intro: "You have requested that your password be changed. If not you, kindly disregard this message. Click or Copy this link to any browser to proceed with your request to change your password: "+verification_link,
                        },
                    };

                    let mail = MailGenerator.generate(response);

                    let message = {
                        from: EMAIL,
                        to:  dfg43.email,
                        subject: "Password Reset Request",
                        html: mail,
                    };

                    transporter.sendMail(message)
                    .then(() => {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Password Reset Request", 
                            data: {
                                link: verification_link, 
                                email : dfg43.email, 
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
    }
};