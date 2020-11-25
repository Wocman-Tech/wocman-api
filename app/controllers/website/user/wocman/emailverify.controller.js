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
      
            var token = jwt.sign({ id: users.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            var authorities = [];

            authorities.push("ROLE_" + "wocman".toUpperCase());
            
            res.status(200).send({
                statusCode: 200,
                status: false,
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