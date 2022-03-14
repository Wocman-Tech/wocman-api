const pathRoot = '../../../../../';
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { s3Upload } = require("../../../../../helpers/s3.upload.helper");

const { WcChat, User, Projects } = require('../../../../../models');

const Helpers = require(pathRoot + "helpers/helper.js");
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { createChatValidation } = require("../../../../../validation/chat.validation");

const Op = db.Sequelize.Op;
exports.chatLog = (req, res, next) => {
    // Username
    var wocmanid = req.body.wocmanid;
    var chatLimit = req.body.chatLimit;
    var perPage = req.body.perPage;
    var page = req.body.page;
    var projectid = req.body.projectid;

    if (typeof wocmanid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "wocmanid field  is undefined.",
                data: []
            }
        );
    } else {
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

        var offsetd = parseInt(perPage, 10) * (parseInt(page, 10) - 1);
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
                                    [Op.or]: [parseInt(wocmanid, 10), parseInt(req.userId, 10)]
                                },
                                receiverid: {
                                    [Op.or]: [parseInt(wocmanid, 10), parseInt(req.userId, 10)]
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
        } else {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "Invalid Projectid",
                    data: []
                }
            );
        }
    }
};


exports.chatSave = async (req, res, next) => {
    // Username
    var receiverId = req.body.receiverId;
    var message = req.body.message;
    var messageType = req.body.messageType;
    var projectId = req.body.projectId;
    var seen = 0;

    const body = {
        receiverId,
        message,
        messageType,
        projectId,
    }
    
    const { error } = await createChatValidation(body);
    if (error) {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: error.message.replace(/[\"]/gi, ''),
                data: []
            });
    }

        const nowTime = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Lagos'
        });

        User.findByPk(req.userId).then(async user => {
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
            const chat_tracker = uuidv4();


            let images = '';
            if (messageType === 'media') {
                const file = req.files;//this are the files

                if (file) {
                    const data = file.map(async (item, index, array) => {
                        const image = await s3Upload(item);
                        if (index === 0) {
                            images += image.Location
                        }
                        else if (index !== array.length - 1) {
                            images += image.Location + Helpers.padTogether()
                        } else {
                            images += image.Location + Helpers.padTogether()
                        }
                    });
                    await Promise.all(data);
                }
            }
            WcChat.create({
                senderid: parseInt(req.userId, 10),
                receiverid: parseInt(receiverId, 10),
                message: message,
                chattime: nowTime,
                messagetype: messageType,
                messagelinks: images,
                seen: seen,
                tracker: chat_tracker,
                projectid: parseInt(projectId, 10)
            }).then(chats => {
                if (!chats) {
                    res.status(400).send({
                        statusCode: 400,
                        status: false,
                        message: "Chat Not Sent",
                        data: []
                    });
                    return chats;
                }

                res.send({
                    statusCode: 201,
                    status: true,
                    message: 'message Sent',
                    data: {
                        accessToken: req.token
                    }
                });
            }).catch(err => {
                res.status(500).send({
                    statusCode: 500,
                    status: false,
                    message: err.message,
                    data: []

                });
            });

        })

    
};
