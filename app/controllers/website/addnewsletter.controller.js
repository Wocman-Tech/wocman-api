const pathRoot = '../../';
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

exports.subscribenewsletter = (req, res, next) => {

    var emailAddress =  req.body.email;
    if (typeof emailAddress === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "email is undefined.",
                data: []
            }
        );
    }else{

        Nletter.findAndCountAll({
            where: {email: emailAddress}
        })
        .then(result => {
            // console.log(result);
            if (result.count == 0) {
               Nletter.create({
                    email: emailAddress
                })
                .then(hgh  => {
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: 'Successful newsletter subscription',
                        data: []
                    });
                })
                .catch(err => {
                    res.status(500).send({ message: err.message });
                });
            }else{
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Email Already subscribed",
                    data: []
                });
            }
        })
        .catch((err)=> {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    }
};