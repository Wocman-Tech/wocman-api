const pathRoot = '../../../../../';
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
const Rootadmin = db.Rootadmin;
const Account = db.Accounts;

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

exports.oneAdmin = (req, res, next) => {
    var id = req.params.id;
    UserRole.findOne({
        where: {userid: id}
    })
    .then(resultRole => {
        if (!resultRole) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not Found",
                data: []
            });
        }
        if (!(resultRole.roleid == 1 )) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not a admin",
                data: []
            });
        }
        User.findOne({
            where: {id: id}
        })
        .then(resultUser => {
            if (!resultUser) {
                 return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not Found",
                    data: []
                });
            }
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "admin was found",
                data: resultUser
            }); 
        })
        .catch((err)=> {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    })
    .catch((err)=> {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};