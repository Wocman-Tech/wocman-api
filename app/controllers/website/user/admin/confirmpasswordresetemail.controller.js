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

exports.wocmanResetPasswordConfirm = (req, res, next) => {
    var email_link =  req.params.link;
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
                    message: "Email link does not exist.",
                    data: []
                });
          
            }
            if (parseInt(users.changepassword, 10) == 1) {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "password reset has been completed already",
                    data: []
                });
            }
            if (typeof users.changepassword === 'undefined') {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "password reset link has not been created",
                    data: []
                });
            }
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            if (isEmailVerified !== true && isEmailVerified !== false) {
                isEmailVerified = false;
            }


            var authorities = [];

            authorities.push("ROLE_" + "admin".toUpperCase());
            
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Reset password confirmation",
                data: {
                    username: users.username,
                    email: users.email,
                    changepassword: users.changepassword,
                    roles: authorities,
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
    }
};