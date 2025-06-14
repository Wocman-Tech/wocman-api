const pathRoot = "../../";
const db = require(pathRoot + "models");
const WCChat = db.WcChat;
const User = db.User;
const Project = db.Projects;
const Joi = require("joi");

const { Op } = db.Sequelize;

exports.chatLog = async (req, res) => {
  try {
    // Validate inputs
    const schema = Joi.object({
      customerid: Joi.number().integer().required(),
      projectid: Joi.number().integer().required(),
      chatLimit: Joi.number().integer().min(1).max(100).optional(),
      perPage: Joi.number().integer().min(1).max(100).optional(),
      page: Joi.number().integer().min(1).optional(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      console.log("Validation error:", error);
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: error.details[0].message,
        data: [],
      });
    }

    const {
      customerid,
      projectid,
      chatLimit = 50,
      perPage = 20,
      page = 1,
    } = value;

    const adminId = req.userId;

    // Fetch customer
    const customer = await User.findByPk(customerid);
    if (!customer) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Customer not found",
        data: [],
      });
    }

    // Fetch project
    const project = await Project.findOne({
      where: {
        id: projectid,
        customerid: customerid,
      },
    });

    if (!project) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Project not found for this customer",
        data: [],
      });
    }

    // Pagination
    const limit = parseInt(chatLimit, 10);
    const offset = parseInt(perPage, 10) * (parseInt(page, 10) - 1);

    // Fetch chat between customer and admin for this project
    const chats = await WCChat.findAll({
      where: {
        projectid: project.id,
        [Op.or]: [
          { senderid: adminId, receiverid: customerid },
          { senderid: customerid, receiverid: adminId },
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
        admin: {
          id: adminId,
        },
        chat: formattedChats,
        project: {
          id: project.id,
          projectId: project.id,
          projectid: project.projectid,
          project: project.project,
          customerid: project.customerid,
        },
      },
    });
  } catch (err) {
    console.error("Admin-customer chatLog error:", err);
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
    const { receiverId, projectId, message, messageType } = req.body;

    const schema = Joi.object({
      receiverId: Joi.number().integer().required(),
      projectId: Joi.number().integer().required(),
      message: Joi.string().min(1).max(225).required(),
      messageType: Joi.string().valid("text", "image", "video").required(),
    });

    const { error } = schema.validate({
      receiverId,
      projectId,
      message,
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

    const sender = await User.findByPk(req.userId);
    if (!sender) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "Sender not found",
        data: [],
      });
    }

    // Confirm project exists and belongs to the specified customer
    const project = await Project.findOne({
      where: {
        id: projectId,
        customerid: receiverId,
      },
    });

    if (!project) {
      return res.status(403).send({
        statusCode: 403,
        status: false,
        message: "No valid project found between customer and admin",
        data: [],
      });
    }

    const nowTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
    });

    const chat = await WCChat.create({
      senderid: req.userId,
      receiverid: receiverId,
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
        chat: {
          message: chat.message,
          senderid: chat.senderid,
          receiverid: chat.receiverid,
          createdAt: chat.createdAt,
        },
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
