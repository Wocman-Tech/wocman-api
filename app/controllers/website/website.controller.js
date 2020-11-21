const db = require("../../models");
const config = require("../../config/auth.config");
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

const {v4 : uuidv4} = require('uuid');
const Helpers = require("../../helpers/helper.js");
const { verifySignUp } = require("../../middleware");

let nodeGeocoder = require('node-geocoder');
 
let options = {
  provider: 'openstreetmap'
};


const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { EMAIL, PASSWORD, MAIN_URL } = require("../../helpers/helper.js");

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

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


//website routes
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
                        wocmans: result.count,
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

exports.newsletter = (req, res, next) => {
    Nletter.findAndCountAll()
    .then(result => {
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Found news letters",
            data: result.rows
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

exports.contactus = (req, res, next) => {

    var emailAddress =  req.body.email;
    var name =  req.body.name;
    var phone =  req.body.phone;
    var inquiry =  req.body.inquiry;
    var message =  req.body.message;

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

        if (typeof name === "undefined") {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "name is undefined.",
                    data: []
                }
            );
        }else{
            if (typeof phone === "undefined") {
                return res.status(400).send(
                    {
                        statusCode: 400,
                        status: false,
                        message: "phone is undefined.",
                        data: []
                    }
                );
            }else{
                if (typeof inquiry === "undefined") {
                    return res.status(400).send(
                        {
                            statusCode: 400,
                            status: false,
                            message: "inquiry is undefined.",
                            data: []
                        }
                    );
                }else{
                    if (typeof message === "undefined") {
                        return res.status(400).send(
                            {
                                statusCode: 400,
                                status: false,
                                message: "message is undefined.",
                                data: []
                            }
                        );
                    }else{
                        Contactus.create({
                            name: emailAddress,
                            email: name,
                            phone: phone,
                            enquiry: inquiry,
                            message: message
                        })
                        .then(hgh  => {
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: 'Successful message',
                                data: []
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
            }
        }
    }
};