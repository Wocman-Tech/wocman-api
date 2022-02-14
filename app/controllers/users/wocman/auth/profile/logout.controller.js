const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;

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

exports.wocmanLogout = (req, res, next) => {
    // Username
    User.findByPk(req.userId).then(user => {
        if (!user) {
          res.status(400).send({
            statusCode: 400,
            status: false,
            message: "User Not Found",
            data: []
          });
          return;
        }
        req.session = null;
        user.update({
            loginlogout:1,
            weblogintoken:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImlhdCI6MTYwNDYyOTY3NSwiZXhwIjoxNjA0NzE2MDc1fQ.w9OuLfh-BohX7stJGQyuvXsaKViDMLzqhYwMNaq_0fs'
        });
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Logded Out",
            data: {
                accessToken: null 
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
};