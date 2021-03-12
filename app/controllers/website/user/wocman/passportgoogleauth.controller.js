const pathRoot = '../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const passport = require('passport');
const cookieSession = require('cookie-session');
require(pathRoot+"config/passportgoogle.config");
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

exports.proceedSignIn = (req, res, next) => {
    email = req.user.email

    if (typeof email === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "Invalid Email",
                data: [] 
            }
        );
    }else{

        var searchemail = {};
       
        if(email && email !== ''){
            searchemail = {'email': email}
        }else{
            searchemail = {'email': {$not: null}};
        }

        User.findOne({
            where: searchemail
        })
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    date: []
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            //making sure a user was signed in appropriately
            user.update({
                loginlogout:0,
                weblogintoken:token
            });
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Login successful",
                data: {
                    email: user.email,
                    verify_email: user.verify_email,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    address: user.address,
                    country: user.country,
                    state: user.state,
                    province: user.province,
                    phone: user.phone,
                    image: user.image,
                    role: 'wocman',
                    unboard: user.unboard,
                    accessToken: token
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

exports.failedSignIn = (req, res, next) => {
    res.status(200).send({
        statusCode: 200,
        status: true,
        message: "Google Verification failed",
        data: {
            accessToken: null
        }
    });
};