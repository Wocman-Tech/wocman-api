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

exports.ProfileUpdate = (req, res, next) => {
    // console.log(req.email_link);
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        if(req.body.firstname && req.body.firstname !== ''){
            var firstname = req.body.firstname;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,   
                message: "Enter Your Firstname",
                data: []
            });
        }

        if(req.body.lastname && req.body.lastname !== ''){
            var lastname = req.body.lastname;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your Lastname",
                data: []
            });
        }

        if(req.body.address && req.body.address !== ''){
            var address = req.body.address;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your Home/Work Address" ,
                data: []
            });
        }


        if(req.body.phone && req.body.phone !== ''){
            var phone = req.body.phone;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your phone number",
                data: [] 
            });
        }

        if(req.body.country && req.body.country !== ''){
            var country = req.body.country;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your country name",
                data: [] 
            });
        }
        if(req.body.state && req.body.state !== ''){
            var state = req.body.state;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your State name",
                data: []
            });
        }

        var province = req.body.address;
       

        if(req.body.username && req.body.username !== ''){
            var username = req.body.username;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your username" ,
                data: []
            });
        }

        //schema
        const joiCleanSchema = Joi.object().keys({ 
            firstname: Joi.string().alphanum().min(3).max(225).required(), 
            lastname: Joi.string().alphanum().min(3).max(225).required(), 
            address: Joi.string().min(10).max(225).required(), 
            phone: Joi.string().min(6).max(225).required(), 
            country: Joi.string().min(3).max(225).required(),
            state: Joi.string().min(3).max(225).required(),
            province: Joi.string().min(3).max(225).required(),
            username: Joi.string().min(3).max(225).required(),
        }); 
        const dataToValidate = {
            firstname: firstname,
            lastname: lastname,
            address: address,
            phone: phone,
            country: country,
            state: state,
            province: province,
            username: username
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
                firstname: firstname,
                lastname: lastname,
                address: address,
                phone: phone,
                country: country,
                state: state,
                province: province,
                username:username
            })
            .then( () => {

                const pushUser = users.id;
                const pushType = 'service';
                const pushBody = 'Dear ' + users.username + ", <br />Your customer profile was Updated. " +
                                " <br />If not you, do report to the admin for rectification. " +
                                "<br/> Thanks";

                Helpers.pushNotice(pushUser, pushBody, pushType);

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Profile Updated",
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