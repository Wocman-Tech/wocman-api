const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");

const AWS  = require('aws-sdk');
AWS.config.region = 'us-east-2';

const s3 = new AWS.S3({
    sslEnabled: true,
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey
})
const fs = require('fs');

const User = db.User;
const Projects = db.Projects;
const WCChat = db.WcChat;

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
    var wocmanid =  req.body.wocmanid;
    var chatLimit =  req.body.chatLimit;
    var perPage =  req.body.perPage;
    var page =  req.body.page;
    var projectid =  req.body.projectid;
    
    if (typeof wocmanid === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "wocmanid field  is undefined.",
                data: []
            }
        );
    }else{
        //schema
        const joiClean = Joi.object().keys({ 
            wocmanid: Joi.number().integer().min(1),
            projectid: Joi.number().integer().min(1),
            chatLimit: Joi.number().integer().min(1).max(100),
            perPage: Joi.number().integer().min(1).max(100),
            page: Joi.number().integer().min(1).max(100),
        }); 
        const dataToValidate = {
            wocmanid: wocmanid,
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
                var unboard = Helpers.returnBoolean(user.unboard);
                var gg = 0;

                Projects.findAll(
                {
                    where: {
                        wocmanid: wocmanid,
                        customerid: req.userId,
                        projectid: projectid
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

                    var wpWocman = [];
                    User.findByPk(wocmanid).then(customeruser => {
                        if (customeruser) {
                            wpWocman.push(
                                [
                                    {
                                        wocman_username: customeruser.username,
                                        wocman_firstname: customeruser.firstname,
                                        wocman_lastname: customeruser.lastname,
                                        wocman_phone: customeruser.phone,
                                        wocman_email: customeruser.email,
                                        wocman_address: customeruser.address,
                                        wocman_country: customeruser.country,
                                        wocman_image: customeruser.image
                                    }
                                ]
                            );
                        }
                    })
                    var wpCustomer = [];
                    wpCustomer.push(
                        [
                            {
                                customer_username: user.username,
                                customer_firstname: user.firstname,
                                customer_lastname: user.lastname,
                                customer_phone: user.phone,
                                customer_image: user.image
                            }
                        ]
                    );

                    WCChat.findAll({
                        where: {
                            senderid: {
                                [Op.or]: [ parseInt(wocmanid, 10), parseInt(req.userId, 10)]
                            },
                            receiverid: {
                                [Op.or]: [ parseInt(wocmanid, 10), parseInt(req.userId, 10)]
                            },
                            projectid: projectid
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
                            message: "Found relationships",
                            data: {
                                accessToken: req.token,
                                customer: wpCustomer,
                                wocman: wpWocman,
                                chat: chats,
                                unboard: unboard
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
    var wocmanid =  req.body.wocmanid;
    var message =  req.body.message;
    var messageType =  req.body.messageType;
    var projectid =  req.body.projectid;
    var seen =  0;
    
    if (typeof wocmanid === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "wocmanid field  is undefined.",
                data: []
            }
        );
    }else{
        if (typeof message === "undefined") {
            return res.status(400).send(
                { 
                    statusCode: 400,
                    status: false,
                    message: "message field is undefined",
                    data: []
                }
            );
        }
        if (typeof messageType === "undefined") {
            return res.status(400).send(
                { 
                    statusCode: 400,
                    status: false,
                    message: "messageType field is undefined",
                    data: []
                }
            );
        }
        if (typeof projectid === "undefined") {
            return res.status(400).send(
                { 
                    statusCode: 400,
                    status: false,
                    message: "projectid field is undefined",
                    data: []
                }
            );
        }

        //schema
        const joiClean = Joi.object().keys({ 
            wocmanid: Joi.number().integer().min(1),
            projectid: Joi.number().integer().min(1),
            message: Joi.string().min(1).max(225),
        });

        const nowTime = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Lagos'
        });

        const dataToValidate = { 
            wocmanid: wocmanid,
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
                var gg = 0;
                Projects.findAll(
                {
                    where: {
                        wocmanid: wocmanid,
                        customerid: req.userId,
                        projectid: projectid
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
                    const chat_tracker = uuidv4();

                    WCChat.create({
                        senderid: parseInt(req.userId, 10),
                        receiverid: parseInt(wocmanid, 10),
                        message: message,
                        chattime: nowTime,
                        messagetype: messageType,
                        messagelinks: '',
                        seen: seen,
                        tracker: chat_tracker,
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

                        //check on the message type
                        if (messageType == 'media') {
                            const file = req.files;//this are the files

                            if(typeof file === "undefined"){

                            }else{

                                var images = [];
                                file.map((item) => {
                                    let myFile =  item.originalname.split(".")
                                    const fileType = myFile[myFile.length - 1]
                                    const dsf = uuidv4();

                                    var params = {
                                        ACL: "public-read-write",
                                        Bucket: config.awsS3BucketName,
                                        Key: item.originalname,
                                        Body:  item.buffer
                                    }

                                    s3.upload(params, (error, data, res) => {
                                        if(error){
                                            // res.status(500).send(error)
                                            console.log(error);
                                        }else{
                                            var fileUrl = data.Location;
                                            if (typeof fileUrl === 'undefined') {
                                                //empty file
                                            }else{
                                                images.push({fileUrl});
                                            }
                                        }
                                        // save project
                                        var all_image_url = '';
                                        for (var i = 0; i < images.length; i++) {
                                            if (i == 0) {
                                                all_image_url =  images[i].fileUrl;
                                            }else{
                                                all_image_url = all_image_url + Helpers.padTogether() +  images[i].fileUrl;
                                            }
                                        }
                                        // console.log(all_image_url);
                                        WCChat.update(
                                            {
                                                messagelinks: all_image_url
                                            },
                                            {
                                                where: {'tracker': chat_tracker}
                                            }
                                        );
                                    });
                                });
                            }
                        }
                        
                        res.send({
                            statusCode: 201,
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
                    message: "Invalid wocman or message",
                    data: []
                }
            );
        }
    }
};
