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

exports.checkCompleteProfileWocman = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.email_link, 10) === 1) {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "Account has been completed before now",
            data: {
                token: null 
            }
        });
    }else{

        var Searchemail = {};

        if(req.email && req.email !== ''){
            Searchemail = {'email': req.email}
        }else{
            Searchemail = {'email': {$not: null}};
        }

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
                message: "Enter Your contact address" ,
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
                message: "Enter Your State name" ,
                data: []
            });
        }
        if(req.body.province && req.body.province !== ''){
            var province = req.body.province;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your address province" ,
                data: []
            });
        }


        User.findOne({
            where: Searchemail
        })
        .then(users => {
            if (!users) {
                res.status(404).send({
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
              verify_email:1
            })
            .then( () => {
                res.send({
                    statusCode: 200,
                    status: true,
                    message: "Profile complete successful",
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

