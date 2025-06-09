const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { S3Client } = require("@aws-sdk/client-s3");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");

const User = db.User;
const Projects = db.Projects;
const WCChat = db.WcChat;
const Op = db.Sequelize.Op;

// AWS S3 Client
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
  forcePathStyle: true,
  tls: true,
});

// Shared project resolver
const resolveProject = async (projectid, userId) => {
  let project = await Projects.findOne({
    where: {
      id: parseInt(projectid, 10),
      [Op.or]: [{ wocmanid: userId }, { customerid: userId }],
    },
  });

  if (!project) {
    const fallback = await Projects.findAll({
      where: {
        [Op.or]: [{ wocmanid: userId }, { customerid: userId }],
      },
      order: [["id", "DESC"]],
    });

    if (!fallback.length) return null;
    console.warn(`Fallback project used: ${fallback[0].id}`);
    return fallback[0];
  }

  return project;
};

exports.chatLog = async (req, res) => {
  try {
    const { customerid, chatLimit, perPage, page, projectid } = req.body;

    const schema = Joi.object({
      customerid: Joi.string().required(),
      projectid: Joi.string().required(),
      chatLimit: Joi.number().integer().min(1).max(100).required(),
      perPage: Joi.number().integer().min(1).max(100).required(),
      page: Joi.number().integer().min(1).required(),
    });

    const { error } = schema.validate({
      customerid,
      projectid,
      chatLimit,
      perPage,
      page,
    });
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: error.details[0].message,
        data: [],
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User not found",
        data: [],
      });
    }

    const customer = await User.findByPk(customerid);
    if (!customer) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Customer not found",
        data: [],
      });
    }

    const project = await resolveProject(projectid, req.userId);
    if (!project) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "No accessible projects found",
        data: [],
      });
    }

    const accept = parseInt(project.wocmanaccept, 10);
    if (![0, 1, 2, 3, 4].includes(accept)) {
      return res.status(403).json({
        statusCode: 403,
        status: false,
        message: "No active project relationship",
        data: [],
      });
    }

    const parsedPerPage = parseInt(perPage, 10);
    const parsedChatLimit = parseInt(chatLimit, 10);
    const offset = parsedPerPage * (page - 1);
    const chats = await WCChat.findAll({
      where: {
        [Op.or]: [
          {
            senderid: req.userId,
            receiverid: customerid,
            projectid: project.id,
          },
          {
            senderid: customerid,
            receiverid: req.userId,
            projectid: project.id,
          },
        ],
      },
      offset,
      limit: parsedChatLimit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["username", "firstname", "lastname", "image"],
        },
      ],
      attributes: ["message", "id", "chattime", "createdAt"],
    });

    return res.json({
      statusCode: 200,
      status: true,
      message: "Chats retrieved successfully",
      data: {
        accessToken: req.token || null,
        customer: [
          {
            custmer_username: customer.username,
            custmer_firstname: customer.firstname,
            custmer_lastname: customer.lastname,
            custmer_phone: customer.phone,
            custmer_email: customer.email,
            custmer_address: customer.address,
            custmer_country: customer.country,
            custmer_image: customer.image,
          },
        ],
        wocman: [
          {
            wocman_username: user.username,
            wocman_firstname: user.firstname,
            wocman_lastname: user.lastname,
            wocman_phone: user.phone,
            wocman_image: user.image,
          },
        ],
        chat: chats,
        project: {
          id: project.id,
          projectid: project.projectid,
          project: project.project,
          wocmanid: project.wocmanid,
          customerid: project.customerid,
        },
      },
    });
  } catch (err) {
    console.error("chatLog error:", err);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
      data: [],
    });
  }
};

exports.chatSave = async (req, res) => {
  try {
    const { customerid, message, messageType, projectid } = req.body;

    const schema = Joi.object({
      customerid: Joi.string().required(),
      message: Joi.string().min(1).max(225).required(),
      projectid: Joi.string().required(),
      messageType: Joi.string().valid("text", "image", "video").required(),
    });

    const { error } = schema.validate({
      customerid,
      message,
      messageType,
      projectid,
    });
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: error.details[0].message,
        data: [],
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "User not found",
        data: [],
      });
    }

    const nowTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
    });

    const project = await resolveProject(projectid, req.userId);
    if (!project) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "No accessible projects found",
        data: [],
      });
    }

    const chat = await WCChat.create({
      senderid: req.userId,
      receiverid: customerid,
      message,
      chattime: nowTime,
      messageType,
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectid: project.id,
    });

    return res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Message sent",
      data: {
        accessToken: req.token || null,
        project,
        message: chat.message,
        senderid: chat.senderid,
        receiverid: chat.receiverid,
        actualProjectId: project.id,
      },
    });
  } catch (err) {
    console.error("chatSave error:", err);
    return res.status(500).send({
      statusCode: 500,
      status: false,
      message: "Internal server error",
      data: [],
    });
  }
};
