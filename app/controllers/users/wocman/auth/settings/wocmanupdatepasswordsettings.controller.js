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
    link: config.website,
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

         var Searchemail = {};

        if(req.email && req.email !== ''){
            Searchemail = {'email': req.email}
        }else{
            Searchemail = {'email': {$not: null}};
        }


        var psd = req.body.password;
        var opsd = req.body.oldpassword;
        var cpsd = req.body.confirmpassword;
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

        if(opsd && opsd !== '' && opsd.length > 7){
            var oldpassword = opsd;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter a valid previous password",
                data: []
            });
        }

        if(cpsd && cpsd !== '' && cpsd.length > 7){
            var confirmpassword = cpsd;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter a valid confirm password",
                data: []
            });
        }


        //schema
        const joiCleanSchema = Joi.object().keys({ 
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(), 
            oldpassword: Joi.string().min(7).max(50).required(),
            confirmpassword: Joi.ref('password')
        }); 
        const dataToValidate = {
          password: password,
          oldpassword: oldpassword,
          confirmpassword: confirmpassword
        }
        const joyResult = joiCleanSchema.validate(dataToValidate);
        if (joyResult.error == null) {
        }else{
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: joyResult.error,
                data: []
            });
        }

        User.findOne({
            where: Searchemail
        })
        .then(users => {
            if (!users) {

                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    data: []
                });
            }
            var passwordIsValid = bcrypt.compareSync(
                oldpassword,
                users.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    statusCode: 401,
                    status: false,
                    accessToken: null,
                    message: "Previous Password is not correct",
                    data: []
                });
            }
            
            if (password !== confirmpassword) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Password Mis-match",
                    data: []
                });
            }

            users.update({
              password: bcrypt.hashSync(password, 8)
            })
            .then( (kk) => {
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
    }
};