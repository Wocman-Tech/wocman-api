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

exports.chatLog = async (req, res) => {
  try {
    const { customerid, chatLimit, perPage, page, projectid } = req.body;

    if (!customerid || !projectid) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: !customerid
          ? "customerid is required"
          : "projectid is required",
        data: [],
      });
    }

    const schema = Joi.object({
      customerid: Joi.string().required(),
      projectid: Joi.string().required(),
      chatLimit: Joi.number().integer().min(1).max(100).required(),
      perPage: Joi.number().integer().min(1).max(100).required(),
      page: Joi.number().integer().min(1).max(100).required(),
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

    const offset = parseInt(perPage) * (parseInt(page) - 1);

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User Not Found",
        data: [],
      });
    }

    // Check project ownership
    let project = await Projects.findOne({
      where: {
        id: parseInt(projectid, 10),
        [Op.or]: [{ wocmanid: req.userId }, { customerid: req.userId }],
      },
    });

    // Fallback to most recent project if not found (just like chatSave)
    if (!project) {
      const availableProjects = await Projects.findAll({
        where: {
          [Op.or]: [{ wocmanid: req.userId }, { customerid: req.userId }],
        },
        attributes: ["id", "project", "projectid", "wocmanid", "customerid"],
        order: [["id", "DESC"]],
      });

      if (availableProjects.length === 0) {
        return res.status(404).json({
          statusCode: 404,
          status: false,
          message: "No accessible projects found for this user",
          data: [],
        });
      }

      project = availableProjects[0];

      console.log(
        `Project ${projectid} not found. Using fallback project ${project.id}`
      );
    }

    // Validate the project relationship and status
    const accept = parseInt(project.wocmanaccept, 10);
    if (![0, 1, 2, 3, 4].includes(accept)) {
      return res.status(403).json({
        statusCode: 403,
        status: false,
        message: "No active project relationship",
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

    // Fetch chats for the project between user and customer
    const chats = await WCChat.findAll({
      where: {
        [Op.or]: [
          {
            senderid: parseInt(req.userId),
            receiverid: parseInt(customerid),
            projectid: project.id,
          },
          {
            senderid: parseInt(customerid),
            receiverid: parseInt(req.userId),
            projectid: project.id,
          },
        ],
      },
      offset,
      limit: parseInt(chatLimit),
      order: [["createdAt", "DESC"]],
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
        chat: chats || [],
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
    console.error("Chat Log Error:", err);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal server error",
      data: [],
    });
  }
};

exports.chatSave = async (req, res, next) => {
  try {
    const { customerid, message, messageType, projectid } = req.body;
    const seen = 0;

    if (!customerid || !message || !messageType || !projectid) {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message:
          "All fields (customerid, message, messageType, projectid) are required.",
        data: [],
      });
    }

    // Validate with Joi
    const joiSchema = Joi.object({
      customerid: Joi.string().min(1).required(),
      message: Joi.string().min(1).max(225).required(),
      projectid: Joi.string().min(1).required(),
      messageType: Joi.string().valid("text", "image", "video").required(),
    });

    const { error } = joiSchema.validate({
      customerid,
      message,
      projectid,
      messageType,
    });
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: error.details[0].message,
        data: [],
      });
    }

    // Check if user exists
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "User Not Found",
        data: [],
      });
    }

    // First check if the specific project exists
    let project = await Projects.findOne({
      where: {
        id: parseInt(projectid, 10),
        [Op.or]: [{ wocmanid: req.userId }, { customerid: req.userId }],
      },
    });

    // If the specific project doesn't exist or user doesn't have access,
    // find any project that the user has access to
    if (!project) {
      const availableProjects = await Projects.findAll({
        where: {
          [Op.or]: [{ wocmanid: req.userId }, { customerid: req.userId }],
        },
        attributes: ["id", "wocmanid", "customerid"],
        order: [["id", "DESC"]],
      });

      if (availableProjects.length === 0) {
        return res.status(404).send({
          statusCode: 404,
          status: false,
          message: "No accessible projects found for this user",
          data: [],
        });
      }

      // Use the most recent accessible project
      project = availableProjects[0];

      // Log the available options
      console.log(
        `Project ${projectid} not found/accessible. Available projects: ${availableProjects
          .map((p) => p.id)
          .join(", ")}. Using project ${project.id}.`
      );
    }

    const nowTime = new Date().toISOString();

    // Create chat message
    const chat = await WCChat.create({
      messageType,
      senderid: req.userId,
      receiverid: customerid,
      message,
      status: seen,
      createdAt: nowTime,
      updatedAt: nowTime,
      projectid: project.id, // Use the found project's ID
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
    return res.status(500).send({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
