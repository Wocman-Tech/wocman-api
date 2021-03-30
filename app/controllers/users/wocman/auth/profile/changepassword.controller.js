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
    if (typeof req.userId == "undefined") {
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
        const joiCleanSchema = Joi.object({
            password: Joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")).required(),
            oldpassword: Joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")).required(),
            confirmpassword: Joi.ref('password')
        });

        var joyresult = joiCleanSchema.validate({ password: psd, oldpassword: opsd, confirmpassword: cpsd});
        var { value, error } = joyresult;
        if (!(typeof error === 'undefined')) {
            var msg = Helpers.getJsondata(error, 'details')[0];
            var msgs = Helpers.getJsondata(msg, 'message');
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: 'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character is required in password field',
                data: []
            })
        }else{
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
            var passwordIsValid = bcrypt.compareSync(
                oldpassword,
                users.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    statusCode: 401,
                    status: false,
                    accessToken: null,
                    message: "oldpassword field is not defined or incorrect",
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