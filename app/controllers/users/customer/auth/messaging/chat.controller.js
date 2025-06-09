const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { s3Upload } = require(pathRoot + "helpers/s3.upload.helper");
const { WcChat, User, Projects } = require(pathRoot + "models");
const WCChat = db.WcChat;
const Helpers = require(pathRoot + "helpers/helper.js");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { createChatValidation, getChatValidation } = require(pathRoot +
  "validation/chat.validation");

const { Op } = db.Sequelize;

const resolveProject = async (projectId, userId) => {
  let project = await Projects.findOne({
    where: {
      id: parseInt(projectId, 10),
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
    // Validate inputs
    const schema = Joi.object({
      wocmanid: Joi.number().integer().required(),
      projectid: Joi.number().integer().required(),
      chatLimit: Joi.number().integer().min(1).max(100).optional(),
      perPage: Joi.number().integer().min(1).max(100).optional(),
      page: Joi.number().integer().min(1).optional(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      console.log("Validation error:", error);
      console.log("Request body:", req.body);
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: error.details[0].message,
        data: [],
      });
    }

    // Use validated values
    const {
      wocmanid,
      projectid,
      chatLimit = 50,
      perPage = 20,
      page = 1,
    } = value;

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: error.details[0].message,
        data: [],
      });
    }

    const userId = req.userId;

    // Fetch current user (customer - the logged-in user)
    const customer = await User.findByPk(userId);
    if (!customer) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Customer not found",
        data: [],
      });
    }

    // Fetch wocman by ID from request body
    const wocman = await User.findByPk(wocmanid);
    if (!wocman) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Wocman not found",
        data: [],
      });
    }

    // Resolve project ensuring customer has access
    const project = await resolveProject(projectid, userId);
    if (!project) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "No accessible projects found",
        data: [],
      });
    }

    // Verify that the wocman is actually assigned to this project
    if (project.wocmanid !== wocmanid) {
      return res.status(403).json({
        statusCode: 403,
        status: false,
        message: "Wocman not assigned to this project",
        data: [],
      });
    }

    // Fetch the wocman associated with this project (redundant now but keeping for consistency)
    // const wocman = await User.findByPk(project.wocmanid);

    // Optionally check wocman acceptance status (adjust field as needed)
    const acceptedStatus = parseInt(project.wocmanaccept, 10);
    if (![0, 1, 2, 3, 4].includes(acceptedStatus)) {
      return res.status(403).json({
        statusCode: 403,
        status: false,
        message: "No active project relationship",
        data: [],
      });
    }

    // Pagination calculation
    const limit = parseInt(chatLimit, 10);
    const offset = parseInt(perPage, 10) * (parseInt(page, 10) - 1);

    // Fetch chats between customer (logged-in user) and wocman for this project
    const chats = await WcChat.findAll({
      where: {
        [Op.or]: [
          {
            senderid: userId, // customer
            receiverid: wocmanid, // wocman
            projectid: project.id,
          },
          {
            senderid: wocmanid, // wocman
            receiverid: userId, // customer
            projectid: project.id,
          },
        ],
      },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["username", "firstname", "lastname", "image"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["username", "firstname", "lastname", "image"],
        },
      ],
      attributes: [
        "message",
        "id",
        "createdAt",
        "chattime",
        "messagetype",
        "messagelinks",
      ],
    });

    // Format messagelinks if needed
    const formattedChats = chats.map((chat) => {
      const plain = chat.get({ plain: true });
      plain.messagelinks = plain.messagelinks
        ? plain.messagelinks.split("/XX98XX").filter(Boolean)
        : [];
      return plain;
    });

    return res.json({
      statusCode: 200,
      status: true,
      message: "Chats retrieved successfully",
      data: {
        accessToken: req.token || null,
        customer: {
          id: customer.id,
          username: customer.username,
          firstname: customer.firstname,
          lastname: customer.lastname,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          country: customer.country,
          image: customer.image,
        },
        wocman: {
          id: wocman.id,
          wocmanid: wocman.id, // For frontend compatibility
          username: wocman.username,
          firstname: wocman.firstname,
          lastname: wocman.lastname,
          wocmanName: `${wocman.firstname} ${wocman.lastname}`, // For frontend compatibility
          phone: wocman.phone,
          image: wocman.image,
        },
        chat: formattedChats,
        project: {
          id: project.id,
          projectId: project.id, // For frontend compatibility
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
    const { wocmanid, message, messageType } = req.body;

    const schema = Joi.object({
      wocmanid: Joi.string().required(),
      message: Joi.string().min(1).max(225).required(),
      messageType: Joi.string().valid("text", "image", "video").required(),
    });

    const { error } = schema.validate({ wocmanid, message, messageType });
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

    // Find any project belonging to this customer that was accepted by the given wocman
    const project = await Projects.findOne({
      where: {
        customerid: req.userId,
        wocmanid: wocmanid,
      },
    });

    if (!project) {
      return res.status(403).send({
        statusCode: 403,
        status: false,
        message: "You cannot message this wocman. No valid project found.",
        data: [],
      });
    }

    const nowTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
    });

    const chat = await WCChat.create({
      senderid: req.userId,
      receiverid: wocmanid,
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
