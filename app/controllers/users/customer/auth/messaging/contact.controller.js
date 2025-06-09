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
      // Skip projects without assigned wocman
      if (
        !project.wocmanid ||
        project.wocmanid === 0 ||
        project.wocmanid === "0"
      ) {
        continue;
      }

      // Fetch project type and wocman information (not customer)
      const [prod, wocman] = await Promise.all([
        Project.findByPk(project.projectid),
        User.findByPk(project.wocmanid), // Get wocman, not customer
      ]);

      if (!prod || !wocman) continue;

      const accept = parseInt(project.wocmanaccept);
      // Fixed condition: include projects with accept >= 0 and <= 4
      if (accept >= 0 && accept <= 4) {
        wocmen.push({
          projectId: project.projectid,
          project: project.description,
          projectType: prod.name,
          // Return wocman information, not customer
          wocmanName: `${wocman.firstname} ${wocman.lastname}`,
          wocmanEmail: wocman.email,
          wocmanPhone: wocman.phone,
          wocmanUsername: wocman.username,
          image: wocman.image,
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
