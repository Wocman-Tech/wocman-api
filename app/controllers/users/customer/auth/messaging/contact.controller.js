const pathRoot = "../../../../../";

const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const User = db.User;
const Projects = db.Projects;
const Project = db.Projecttype;

const { v4: uuidv4 } = require("uuid");
const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// chat routes
exports.wocmanChatContact = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "User Not Found",
        data: [],
      });
    }

    const unboard = Helpers.returnBoolean(user.unboard);
    const wocmen = [];

    const projectBase = await Projects.findAll({
      where: { customerid: req.userId },
    });

    if (!projectBase || projectBase.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "No Projects Found",
        data: [],
      });
    }

    for (const project of projectBase) {
      // Optional optimization: Fetch both in parallel
      const [prod, cust] = await Promise.all([
        Project.findByPk(project.projectid),
        User.findByPk(project.wocmanid),
      ]);

      if (!prod || !cust) continue;

      const accept = parseInt(project.wocmanaccept);
      if (accept > 1 && accept < 5) {
        wocmen.push({
          projectId: project.projectid,
          project: project.description,
          projectType: prod.name,
          customerName: `${cust.firstname} ${cust.lastname}`,
          customerEmail: cust.email,
          customerPhone: cust.phone,
          customerUsername: cust.username,
          image: cust.image,
          wocmanid: project.wocmanid,
        });
      }
    }

    return res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Found Current Projects Wocman",
      data: {
        accessToken: req.token,
        wocmen,
        unboard,
      },
    });
  } catch (err) {
    console.error("wocmanChatContact error:", err.message);
    return res.status(500).send({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
      data: [],
    });
  }
};
