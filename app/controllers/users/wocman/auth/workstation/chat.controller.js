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
    var projectid =  req.body.projectid;
    var chatLimit =  req.body.chatLimit;
    var perPage =  req.body.perPage;
    var page =  req.body.page;
    
    if (typeof projectid === "undefined") {
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
            projectid: Joi.number().integer().min(1),
            chatLimit: Joi.number().integer().min(1).max(100),
            perPage: Joi.number().integer().min(1).max(100),
            page: Joi.number().integer().min(1).max(100),
        }); 
        const dataToValidate = { 
          projectid: projectid,
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
                Projects.findByPk(projectid).then(project => {
                    if (!project) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        Project: "Project Not Found",
                        data: []
                      });
                      return;
                    }
                    if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project  Owner not resolved",
                            data: []
                        });
                    }


                    WCChat.findAll({
                        where: {
                            projectid: parseInt(projectid, 10),
                            senderid: {
                                [Op.or]: [ parseInt(project.customerid, 10), parseInt(req.userId, 10)]
                            },
                            receiverid: {
                                [Op.or]: [ parseInt(project.customerid, 10), parseInt(req.userId, 10)]
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
                            message: "Project Chat Not Found",
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
    var projectid =  req.body.projectid;
    var message =  req.body.message
    var seen =  0;
    
    if (typeof projectid === "undefined") {
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
            projectid: Joi.number().integer().min(1),
            message: Joi.string().min(1).max(225),
        }); 
        const dataToValidate = { 
          projectid: projectid,
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
                Projects.findByPk(projectid).then(project => {
                    if (!project) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        Project: "Project Not Found",
                        data: []
                      });
                      return;
                    }
                    if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project  Owner not resolved",
                            data: []
                        });
                    }
                    WCChat.create({
                        senderid: parseInt(project.wocmanid, 10),
                        receiverid: parseInt(project.customerid, 10),
                        message: message,
                        seen: seen,
                        projectid: parseInt(projectid, 10)
                    }).then(chats => {
                        if (!chats) {
                          res.status(404).send({
                             statusCode: 404,
                            status: false,
                            message: "Project Chat Not Sent",
                            data: []
                          });
                          return;
                        }
                        res.send({
                            statusCode: 200,
                            status: true, 
                            message: 'message Saved',
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
