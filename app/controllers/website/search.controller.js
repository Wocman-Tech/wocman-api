const pathRoot = '../../';
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

exports.locationData = (req, res, next) => {
    var locationName =  req.params.location;
    if (typeof locationName === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "location is undefined.",
                data: []
            }
        );
    }else{

        let geoCoder = nodeGeocoder(options);geoCoder.geocode(locationName)
        .then((locationResult)=> {
            User.findAndCountAll({
                where: {address: locationName}
            })
            .then(result => {
                var isWocman = 0;
                var isWocmanActive = 0;
                if (result) {
                    for (var i = 0; i < result.length; i++) {
                        UserRole.findOne({
                            where: {userid: result[i].id}
                        }).then(wocmanrole => {
                            if (wocmanrole && (wocmanrole.roleid == 2) ) {
                                isWocman = isWocman + 1;
                            }
                        }).catch((err) => {
                            //should not be checked
                        });
                        Projects.findAndCountAll({
                            where: {wocmanid: result[i].id}
                        }).then(doneProject => {
                            if (doneProject) {
                                var singleComplete = 0;
                                for (var i = 0; i < doneProject.length; i++) {
                                    if (doneProject[i].projectcomplete == 1) {
                                        singleComplete = 1;
                                    }
                                }
                                isWocmanActive = isWocmanActive +  singleComplete;
                            }
                        }).catch((err) => {
                            //should not be checked
                        });
                    }
                }

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Location mapped",
                    data: {
                        location: locationName,
                        data: locationResult,
                        wocman: isWocman,
                        active: isWocmanActive
                    }
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
    }
};