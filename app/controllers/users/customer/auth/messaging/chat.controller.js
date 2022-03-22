const pathRoot = '../../../../../';
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { s3Upload } = require("../../../../../helpers/s3.upload.helper");

const { WcChat, User, Projects } = require('../../../../../models');

const Helpers = require(pathRoot + "helpers/helper.js");
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { createChatValidation, getChatValidation } = require("../../../../../validation/chat.validation");

const Op = db.Sequelize.Op;
exports.chatLog = async (req, res, next) => {
    const receiverId = req.params.receiverId;
    const projectId = req.params.projectId;

    const params = {
        receiverId,
        projectId,
    }

    const { error } = await getChatValidation(params);
    if (error) {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: error.message.replace(/[\"]/gi, ''),
                data: []
            });
    }

    User.findByPk(req.userId).then(user => {
        if (!user) {
            res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not Found",
                data: []
            });
        }
        var unboard = Helpers.returnBoolean(user.unboard);
        var gg = 0;

        WcChat.findAll({
            where: {
                senderid: {
                    [Op.or]: [parseInt(receiverId, 10), parseInt(req.userId, 10)]
                },
                receiverid: {
                    [Op.or]: [parseInt(receiverId, 10), parseInt(req.userId, 10)]
                },
                projectid: parseInt(projectId, 10)
            },
            include: [
                {
                    model: Projects,
                    as: 'project',
                },
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'firstname', 'lastname', 'email', 'username', 'image'],
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'firstname', 'lastname', 'email', 'username', 'image'],
                },
            ],
            order: [['createdAt', 'DESC']],
        }).then((chats) => {
            const result = JSON.parse(JSON.stringify(chats))

            const rows = result.map((el) => {
                const imagesArray = {
                    messagelinks: (el.messagelinks.length === 0) ? [] : el.messagelinks.split('/XX98XX')
                }
                return {
                    ...el,
                    ...imagesArray,
                }
            });
            res.send({
                statusCode: 200,
                status: true,
                message: "Chats fetched successfully",
                data: {
                    accessToken: req.token,
                    chat: rows,
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
        .catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: []
            });
        });
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
