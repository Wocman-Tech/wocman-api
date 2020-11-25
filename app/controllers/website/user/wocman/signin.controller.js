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

exports.signInWocman = (req, res, next) => {

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

            var searchemail = {};
            var searchPassword = {};
            if(req.body.password && req.body.password !== ''){
                searchPassword = {'password': req.body.password};
            }else{
                searchPassword = {'password': {$not: null}};
            }
            if(req.body.email && req.body.email !== ''){
                searchemail = {'email': req.body.email}
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

                var passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );

                if (!passwordIsValid) {
                    return res.status(401).send({
                        statusCode: 401,
                        status: false,
                          accessToken: null,
                          message: "Invalid Password!",
                          data: []
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

                var authorities = [];
                authorities.push("ROLE_" + "wocman".toUpperCase());
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Login successful",
                    data: {
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
    }
};