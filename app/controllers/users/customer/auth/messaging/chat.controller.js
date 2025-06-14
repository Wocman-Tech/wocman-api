const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { s3Upload } = require(pathRoot + "helpers/s3.upload.helper");
const { WcChat, User, Projects } = require(pathRoot + "models");
const WCChat = db.WcChat;
const RootAdmin = db.RootAdmin;
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
      wocmanid: Joi.alternatives()
        .try(Joi.number().integer(), Joi.string().pattern(/^admin-\d+$/))
        .required(),
      projectid: Joi.number().integer().required(),
      chatLimit: Joi.number().integer().min(1).max(100).optional(),
      perPage: Joi.number().integer().min(1).max(100).optional(),
      page: Joi.number().integer().min(1).optional(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: error.details[0].message,
        data: [],
      });
    }

    const originalWocmanId = value.wocmanid;
    let wocman;
    let wocmanDisplayData = {};
    let isAdmin = false;

    // Hard-coded admin display data
    const ADMIN_DISPLAY_DATA = {
      username: "super_admin",
      firstname: "Admin",
      lastname: "Support",
      wocmanName: "Admin Support",
      phone: null,
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/019/194/935/small_2x/global-admin-icon-color-outline-vector.jpg",
    };

    // Determine if it's an admin chat
    if (
      typeof originalWocmanId === "string" &&
      /^admin-\d+$/.test(originalWocmanId)
    ) {
      isAdmin = true;
      const adminId = parseInt(originalWocmanId.split("-")[1], 10);
      wocman = await RootAdmin.findByPk(adminId);

      if (!wocman) {
        return res.status(404).json({
          statusCode: 404,
          status: false,
          message: "Admin not found",
          data: [],
        });
      }

      wocmanDisplayData = {
        id: `admin-${wocman.id}`,
        wocmanid: `admin-${wocman.id}`,
        ...ADMIN_DISPLAY_DATA,
      };
    } else {
      // Regular wocman
      wocman = await User.findByPk(originalWocmanId);
      if (!wocman) {
        return res.status(404).json({
          statusCode: 404,
          status: false,
          message: "Wocman not found",
          data: [],
        });
      }

      wocmanDisplayData = {
        id: wocman.id,
        wocmanid: wocman.id,
        username: wocman.username,
        firstname: wocman.firstname,
        lastname: wocman.lastname,
        wocmanName: `${wocman.firstname} ${wocman.lastname}`,
        phone: wocman.phone,
        image: wocman.image,
      };
    }

    const userId = req.userId;

    // Find the customer (sender/requester)
    const customer = await User.findByPk(userId);
    if (!customer) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Customer not found",
        data: [],
      });
    }

    const project = await resolveProject(value.projectid, userId);
    if (!project) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "No accessible projects found",
        data: [],
      });
    }

    // Only check wocman assignment if it's not admin
    if (!isAdmin && project.wocmanid !== parseInt(originalWocmanId)) {
      return res.status(403).json({
        statusCode: 403,
        status: false,
        message: "Wocman not assigned to this project",
        data: [],
      });
    }

    const acceptedStatus = parseInt(project.wocmanaccept, 10);
    if (![0, 1, 2, 3, 4].includes(acceptedStatus)) {
      return res.status(403).json({
        statusCode: 403,
        status: false,
        message: "No active project relationship",
        data: [],
      });
    }

    const limit = parseInt(value.chatLimit || 50, 10);
    const offset =
      parseInt(value.perPage || 20, 10) * (parseInt(value.page || 1, 10) - 1);

    // Use numeric id for querying chats regardless of admin or user
    const wocmanDbId = wocman.id;

    // For admin chats, skip includes entirely and handle manually
    let includeModels = [];

    if (!isAdmin) {
      // Regular user chat - include both sender and receiver
      includeModels = [
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
      ];
    }
    // For admin chats, we don't include any models - we'll manually add the data later

    const chats = await WcChat.findAll({
      where: {
        [Op.or]: [
          {
            senderid: userId,
            receiverid: wocmanDbId,
            projectid: project.id,
          },
          {
            senderid: wocmanDbId,
            receiverid: userId,
            projectid: project.id,
          },
        ],
      },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: includeModels,
      attributes: [
        "id",
        "message",
        "senderid",
        "receiverid",
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

      // Handle admin display names
      if (isAdmin) {
        // Since we skipped includes for admin chats, manually populate all sender/receiver data
        if (plain.senderid === wocmanDbId) {
          // Admin is sender
          plain.sender = {
            username: ADMIN_DISPLAY_DATA.username,
            firstname: ADMIN_DISPLAY_DATA.firstname,
            lastname: ADMIN_DISPLAY_DATA.lastname,
            image: ADMIN_DISPLAY_DATA.image,
          };
        } else {
          // Customer is sender
          plain.sender = {
            username: customer.username,
            firstname: customer.firstname,
            lastname: customer.lastname,
            image: customer.image,
          };
        }

        if (plain.receiverid === wocmanDbId) {
          // Admin is receiver
          plain.receiver = {
            username: ADMIN_DISPLAY_DATA.username,
            firstname: ADMIN_DISPLAY_DATA.firstname,
            lastname: ADMIN_DISPLAY_DATA.lastname,
            image: ADMIN_DISPLAY_DATA.image,
          };
        } else {
          // Customer is receiver
          plain.receiver = {
            username: customer.username,
            firstname: customer.firstname,
            lastname: customer.lastname,
            image: customer.image,
          };
        }
      }

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
        wocman: wocmanDisplayData,
        chat: formattedChats,
        project: {
          id: project.id,
          projectId: project.id,
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
    const { wocmanid, message, messageType, projectid } = req.body;

    const schema = Joi.object({
      wocmanid: Joi.alternatives()
        .try(Joi.number().integer(), Joi.string().pattern(/^admin-\d+$/))
        .required(),
      message: Joi.string().min(1).max(225).required(),
      messageType: Joi.string().valid("text", "image", "video").required(),
      projectid: Joi.number().integer().required(),
    });

    const { error } = schema.validate({
      wocmanid,
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

    const sender = await User.findByPk(req.userId);
    if (!sender) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "Sender not found",
        data: [],
      });
    }

    let receiverIsAdmin = false;
    let receiverDbId;
    let adminUser = null;
    let wocmanUser = null;

    // Hard-coded admin display data
    const ADMIN_DISPLAY_DATA = {
      username: null,
      firstname: "Admin",
      lastname: "Support",
      phone: null,
      image: null,
    };

    // Detect if receiver is admin ("admin-123" format)
    if (typeof wocmanid === "string" && /^admin-\d+$/.test(wocmanid)) {
      receiverIsAdmin = true;
      const adminId = parseInt(wocmanid.split("-")[1], 10);
      adminUser = await RootAdmin.findByPk(adminId);
      if (!adminUser) {
        return res.status(404).send({
          statusCode: 404,
          status: false,
          message: "Admin not found",
          data: [],
        });
      }
      receiverDbId = adminUser.id; // Use numeric ID for database operations
    } else {
      // Regular wocman
      receiverDbId = parseInt(wocmanid, 10);
      wocmanUser = await User.findByPk(receiverDbId);
      if (!wocmanUser) {
        return res.status(404).send({
          statusCode: 404,
          status: false,
          message: "Wocman not found",
          data: [],
        });
      }
    }

    // Validate project access
    const project = await resolveProject(projectid, req.userId);
    if (!project) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "No accessible projects found",
        data: [],
      });
    }

    // Validate project relationship
    if (!receiverIsAdmin && project.wocmanid !== receiverDbId) {
      return res.status(403).send({
        statusCode: 403,
        status: false,
        message: "Wocman not assigned to this project",
        data: [],
      });
    }

    // Check project status
    const acceptedStatus = parseInt(project.wocmanaccept, 10);
    if (![0, 1, 2, 3, 4].includes(acceptedStatus)) {
      return res.status(403).send({
        statusCode: 403,
        status: false,
        message: "No active project relationship",
        data: [],
      });
    }

    const nowTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
    });

    // Create chat with numeric receiverDbId
    const chat = await WcChat.create({
      senderid: req.userId,
      receiverid: receiverDbId,
      message,
      chattime: nowTime,
      messagetype: messageType, // Note: using lowercase 't' to match your schema
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectid: project.id,
    });

    // Compose receiver info for response
    let receiverInfo = {};
    if (receiverIsAdmin) {
      receiverInfo = {
        id: `admin-${adminUser.id}`,
        wocmanid: `admin-${adminUser.id}`,
        ...ADMIN_DISPLAY_DATA,
      };
    } else {
      receiverInfo = {
        id: wocmanUser.id,
        wocmanid: wocmanUser.id,
        username: wocmanUser.username,
        firstname: wocmanUser.firstname,
        lastname: wocmanUser.lastname,
        phone: wocmanUser.phone,
        image: wocmanUser.image,
      };
    }

    return res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Message sent successfully",
      data: {
        accessToken: req.token || null,
        customer: {
          id: sender.id,
          username: sender.username,
          firstname: sender.firstname,
          lastname: sender.lastname,
          phone: sender.phone,
          email: sender.email,
          address: sender.address,
          country: sender.country,
          image: sender.image,
        },
        receiver: receiverInfo,
        project: {
          id: project.id,
          projectId: project.id,
          projectid: project.projectid,
          project: project.project,
          wocmanid: project.wocmanid,
          customerid: project.customerid,
        },
        chat: {
          id: chat.id,
          message: chat.message,
          senderid: chat.senderid,
          receiverid: chat.receiverid,
          messagetype: chat.messagetype,
          chattime: chat.chattime,
          createdAt: chat.createdAt,
          projectid: chat.projectid,
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
