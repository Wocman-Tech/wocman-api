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
exports.chatLog = (req, res, next) => {
    // Username
    var customerid =  req.body.customerid;
    var chatLimit =  req.body.chatLimit;
    var perPage =  req.body.perPage;
    var page =  req.body.page;
    
    if (typeof customerid === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "Customer  is undefined.",
                data: []
            }
        );
    }else{
        //schema
        const joiClean = Joi.object().keys({ 
            customerid: Joi.number().integer().min(1),
            chatLimit: Joi.number().integer().min(1).max(100),
            perPage: Joi.number().integer().min(1).max(100),
            page: Joi.number().integer().min(1).max(100),
        }); 
        const dataToValidate = {
          customerid: customerid,
          chatLimit: chatLimit,
          perPage: perPage,
          page: page
        }
        var offsetd = parseInt(perPage, 10) * (parseInt(page, 10)-1);
        var chatLimit = parseInt(chatLimit, 10);
        // const result = Joi.validate(dataToValidate, joiClean);
        const result = joiClean.validate(dataToValidate);
        if (result.error == null) {
            User.findByPk(req.userId).then(user => {
                if (!user) {
                  res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not Found",
                    data: []
                  });
                  return;
                }
                var gg = 0;

                Projects.findAll(
                {
                    where: {
                        wocmanid: req.userId,
                        customerid: customerid
                    }
                }).then(project => {
                    if (!project) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        Project: "Project Not Found",
                        data: []
                      });
                      return;
                    }
                    
                    for (var i = 0; i < project.length; i++) {
                        if (parseInt(project[i].wocmanaccept, 10) > 1 && parseInt(project[i].wocmanaccept, 10) < 5) {
                            gg = gg + 1;
                        }
                    }
                    if (gg > 0) {

                        WCChat.findAll({
                            where: {
                                senderid: {
                                    [Op.or]: [ parseInt(customerid, 10), parseInt(req.userId, 10)]
                                },
                                receiverid: {
                                    [Op.or]: [ parseInt(customerid, 10), parseInt(req.userId, 10)]
                                }
                            },
                            offset: offsetd,
                            limit: chatLimit,
                            order: [
                                ["createdAt", "DESC"]
                            ],
                        }).then(chats => {
                            if (!chats) {
                              res.status(404).send({
                                 statusCode: 404,
                                status: false,
                                message: "Chat Not Found",
                                data: []
                              });
                              return;
                            }
                            res.send({
                                statusCode: 200,
                                status: true, 
                                message: "seen messages",
                                data: {
                                    accessToken: req.token,
                                    customerid: parseInt(project.customerid, 10),
                                    chat: chats
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
                    }else{
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "Wocman has no relationship with customer currently",
                            data: []
                        });
                    }
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
        }else{
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "Invali Projectid",
                    data: []
                }
            );
        }
    }
};

exports.chatSave = (req, res, next) => {
    // Username
    var customerid =  req.body.customerid;
    var message =  req.body.message
    var seen =  0;
    
    if (typeof customerid === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "project  is undefined.",
                data: []
            }
        );
    }else{
        //schema
        const joiClean = Joi.object().keys({ 
            customerid: Joi.number().integer().min(1),
            message: Joi.string().min(1).max(225),
        }); 
        const dataToValidate = { 
          customerid: customerid,
          message: message
        }
        // const result = Joi.validate(dataToValidate, joiClean);
        const result = joiClean.validate(dataToValidate);
        if (result.error == null) {
            User.findByPk(req.userId).then(user => {
                if (!user) {
                  res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not Found",
                    data: []
                  });
                  return;
                }
                var gg = 0;
                var projectid = 0;
                Projects.findAll(
                {
                    where: {
                        wocmanid: req.userId,
                        customerid: customerid
                    }
                }).then(project => {
                    if (!project) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        Project: "Project Not Found",
                        data: []
                      });
                      return;
                    }
                    for (var i = 0; i < project.length; i++) {
                        if (parseInt(project[i].wocmanaccept, 10) > 1 && parseInt(project[i].wocmanaccept, 10) < 5) {
                            gg = gg + 1;
                            projectid = projectid;
                        }
                    }
                    if (gg > 0) {
                    
                        WCChat.create({
                            senderid: parseInt(req.userId, 10),
                            receiverid: parseInt(customerid, 10),
                            message: message,
                            seen: seen,
                            projectid: parseInt(projectid, 10)
                        }).then(chats => {
                            if (!chats) {
                              res.status(404).send({
                                 statusCode: 404,
                                status: false,
                                message: "Chat Not Sent",
                                data: []
                              });
                              return;
                            }
                            res.send({
                                statusCode: 200,
                                status: true, 
                                message: 'message Sent',
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
                    }
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
        }else{
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "Invali customerid",
                    data: []
                }
            );
        }
    }
};
