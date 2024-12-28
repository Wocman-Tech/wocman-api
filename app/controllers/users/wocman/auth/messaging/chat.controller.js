const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const fs = require("fs");
const { S3Client } = require("@aws-sdk/client-s3"); // Import the PutObjectCommand

// Create the S3 client instance
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
  forcePathStyle: true, // Optional, if you use path-style URLs
  tls: true, // Ensures SSL is enabled (same as sslEnabled: true in v2)
});

const User = db.User;
const Projects = db.Projects;
const WCChat = db.WcChat;

const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");

const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const Op = db.Sequelize.Op;

exports.chatLog = (req, res, next) => {
  // Username
  var customerid = req.body.customerid;
  var chatLimit = req.body.chatLimit;
  var perPage = req.body.perPage;
  var page = req.body.page;
  var projectid = req.body.projectid;

  if (typeof customerid === "undefined") {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "customerid field  is undefined.",
      data: [],
    });
  } else {
    if (typeof projectid === "undefined") {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "projectid field  is undefined.",
        data: [],
      });
    }
    //schema
    const joiClean = Joi.object().keys({
      customerid: Joi.string().min(1),
      chatLimit: Joi.number().integer().min(1).max(100),
      perPage: Joi.number().integer().min(1).max(100),
      page: Joi.number().integer().min(1).max(100),
    });
    const dataToValidate = {
      customerid: customerid,
      chatLimit: chatLimit,
      perPage: perPage,
      page: page,
    };
    var offsetd = parseInt(perPage, 10) * (parseInt(page, 10) - 1);
    var chatLimit = parseInt(chatLimit, 10);
    // const result = Joi.validate(dataToValidate, joiClean);
    const result = joiClean.validate(dataToValidate);
    if (result.error == null) {
      User.findByPk(req.userId)
        .then((user) => {
          if (!user) {
            res.status(404).send({
              statusCode: 404,
              status: false,
              message: "User Not Found",
              data: [],
            });
            return;
          }
          var gg = 0;

          Projects.findAll({
            where: {
              wocmanid: req.userId,
              customerid: customerid,
            },
          })
            .then((project) => {
              if (!project) {
                res.status(404).send({
                  statusCode: 404,
                  status: false,
                  Project: "Project Not Found",
                  data: [],
                });
                return;
              }

              var wpCustomer = [];
              User.findByPk(customerid).then((customeruser) => {
                if (customeruser) {
                  wpCustomer.push([
                    {
                      custmer_username: customeruser.username,
                      custmer_firstname: customeruser.firstname,
                      custmer_lastname: customeruser.lastname,
                      custmer_phone: customeruser.phone,
                      custmer_email: customeruser.email,
                      custmer_address: customeruser.address,
                      custmer_country: customeruser.country,
                      custmer_image: customeruser.image,
                    },
                  ]);
                }
              });
              var wpWocman = [];
              wpWocman.push([
                {
                  wocman_username: user.username,
                  wocman_firstname: user.firstname,
                  wocman_lastname: user.lastname,
                  wocman_phone: user.phone,
                  wocman_image: user.image,
                },
              ]);

              for (var i = 0; i < project.length; i++) {
                if (
                  parseInt(project[i].wocmanaccept, 10) > 1 &&
                  parseInt(project[i].wocmanaccept, 10) < 5
                ) {
                  gg = gg + 1;
                }
              }
              if (gg > 0) {
                WCChat.findAll({
                  where: {
                    senderid: {
                      [Op.or]: [
                        parseInt(customerid, 10),
                        parseInt(req.userId, 10),
                      ],
                    },
                    receiverid: {
                      [Op.or]: [
                        parseInt(customerid, 10),
                        parseInt(req.userId, 10),
                      ],
                    },
                    projectid: projectid,
                  },
                  offset: offsetd,
                  limit: chatLimit,
                  order: [["createdAt", "DESC"]],
                })
                  .then((chats) => {
                    if (!chats) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Chat Not Found",
                        data: [],
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
                      },
                    });
                  })
                  .catch((err) => {
                    res.status(500).send({
                      statusCode: 500,
                      status: false,
                      message: err.message,
                      data: [],
                    });
                  });
              } else {
                return res.status(404).send({
                  statusCode: 404,
                  status: false,
                  message: "Wocman has no relationship with customer currently",
                  data: [],
                });
              }
            })
            .catch((err) => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
        })
        .catch((err) => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    } else {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "Invalid Projectid",
        data: [],
      });
    }
  }
};

exports.chatSave = (req, res, next) => {
  // Username
  var customerid = req.body.customerid;
  var message = req.body.message;
  var messageType = req.body.messageType;
  var projectid = req.body.projectid;
  var seen = 0;

  if (typeof customerid === "undefined") {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "customerid field  is undefined.",
      data: [],
    });
  } else {
    if (typeof message === "undefined") {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "message field is undefined",
        data: [],
      });
    }

    if (typeof messageType === "undefined") {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "messageType field is undefined",
        data: [],
      });
    }
    if (typeof projectid === "undefined") {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "projectid field is undefined",
        data: [],
      });
    }
    //schema
    const joiClean = Joi.object().keys({
      customerid: Joi.string().min(1),
      message: Joi.string().min(1).max(225),
      projectid: Joi.string().min(1).max(225),
    });
    const dataToValidate = {
      customerid: customerid,
      projectid: projectid,
      message: message,
    };
    const nowTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
    });

    const result = joiClean.validate(dataToValidate);
    if (result.error == null) {
      User.findByPk(req.userId)
        .then((user) => {
          if (!user) {
            res.status(404).send({
              statusCode: 404,
              status: false,
              message: "User Not Found",
              data: [],
            });
            return;
          }
          var gg = 0;
          Projects.findAll({
            where: {
              wocmanid: req.userId,
              customerid: customerid,
              projectid: projectid,
            },
          })
            .then((project) => {
              if (!project) {
                res.status(404).send({
                  statusCode: 404,
                  status: false,
                  Project: "Project Not Found",
                  data: [],
                });
                return;
              }

              const wcchat = {
                messageType: messageType,
                senderid: req.userId,
                receiverid: customerid,
                message: message,
                status: seen,
                createdAt: nowTime,
                updatedAt: nowTime,
                projectid: projectid,
              };

              WCChat.create(wcchat)
                .then((chat) => {
                  if (chat) {
                    res.status(200).send({
                      statusCode: 200,
                      status: true,
                      message: "message sent",
                      data: {
                        accessToken: req.token,
                        project: project,
                        message: chat.message,
                        senderid: chat.senderid,
                        receiverid: chat.receiverid,
                      },
                    });
                  } else {
                    res.status(404).send({
                      statusCode: 404,
                      status: false,
                      message: "Unable to save message",
                      data: [],
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    statusCode: 500,
                    status: false,
                    message: err.message,
                    data: [],
                  });
                });
            })
            .catch((err) => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
        })
        .catch((err) => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    } else {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "Invalid fields or parameters",
        data: [],
      });
    }
  }
};

