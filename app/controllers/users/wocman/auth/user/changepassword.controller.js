const pathRoot = '../../../../../';
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

exports.wocmanChangePassword = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.userId, 10) === 1) {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        var psd = req.body.password;
        if(psd && psd !== '' && psd.length > 7){
            var password = psd;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter a valid password. min of 8 characters",
                data: []
            });
        }

        User.findByPk(req.userId)
        .then(users => {
            if (!users) {

                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    data: []
                });
            }

            users.update({
              password: bcrypt.hashSync(password, 8)
            })
            .then( () => {

                var certificates = [];
                Cert.findAll({
                    where: req.userId
                })
                .then(certs => {
                    if (!certs) {
                    }else{
                        for (let i = 0; i < certs.length; i++) {
                          certificates.push(certs[i].name+"::"+Helpers.coreProjectPath() + Helpers.pathToImages() +  'wocman/certificate/'+ certs[i].picture);
                        }
                    }
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Password was Changed",
                        data: {
                            accessToken: req.token
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