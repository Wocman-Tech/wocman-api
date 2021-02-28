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

const {v4 : uuidv4} = require('uuid');
const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");

let nodeGeocoder = require('node-geocoder');
 
let options = {
  provider: 'openstreetmap'
};


const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const Joi = require('joi'); 

const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

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

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// chat routes
exports.wocmanChatProjectCustomer = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "project is undefined.",
                data: []
            }
        );
    }else{

        const joiClean = Joi.object().keys({ 
            projectid: Joi.number().integer().min(1), 
        }); 
        const dataToValidate = { 
          projectid: projectid 
        } 
        const result = Joi.validate(dataToValidate, joiClean);
        if (result.error == null) {

            // result.error == null means valid
            
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
                Projects.findByPk(projectid).then(projectBase => {
                    if (!projectBase) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Not Found",
                        data: []
                      });
                      return;
                    }
                    if (!(projectBase.wocmanid == user.id)) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Not awarded to you",
                        data: []
                      });
                      return;
                    }
                    var chat = [];

                    WCChat.findAll({
                        
                        where: { 
                            senderid: user.id,
                            [Op.or]: {receiverid: user.id}
                        }
                    }).then(chats => {
                        for (var i = 0; i < chats.length; i++) {
                            if (((chats[i].senderid == user.id) && (chats[i].receiverid == projectBase.customerid)) || ((chats[i].senderid == projectBase.customerid) && (chats[i].receiverid == user.id))) {
                                chat.push(chats[i].message);
                            }
                        }
                   
                        // console.log(projectBase.projectid);
                        Project.findByPk(projectBase.projectid).then(projecttypes => {
                            if (!projecttypes) {
                              res.status(404).send({
                                statusCode: 404,
                                status: false,
                                message: "Project Type Not Found",
                                data: []
                              });
                              return;
                            }
                       
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Chat Saved",
                                data: {
                                    accessToken: req.token,
                                    project_type_name: projecttypes.name,
                                    project_type_description: projecttypes.description,
                                    customerid: projectBase.customerid,
                                    chat: chat
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
