const pathRoot = "../../../../../";

const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const User = db.User;
const Projects = db.Projects;
const Project = db.Projecttype;
const RootAdmin = db.RootAdmin;

const { v4: uuidv4 } = require("uuid");
const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");

const Op = db.Sequelize.Op;

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
    const contacts = [];

    // 1. Get all projects belonging to the customer
    const projectBase = await Projects.findAll({
      where: { customerid: req.userId },
    });

    // 2. Get all admins once
    const admins = await RootAdmin.findAll();

    // 3. Loop through all customer projects
    if (projectBase && projectBase.length > 0) {
      for (const project of projectBase) {
        // Always add admin contact
        for (const admin of admins) {
          contacts.push({
            projectId: project.id,
            project: project.description,
            projectType: "Admin Assistance",
            wocmanName: "Admin Support",
            wocmanEmail: admin.email,
            wocmanPhone: null,
            wocmanUsername: null,
            image: null,
            wocmanid: `admin-${admin.id}`, // avoid clash with numeric IDs
            role: "admin",
          });
        }

        // Then add wocman contact if available
        if (
          project.wocmanid &&
          project.wocmanid !== 0 &&
          project.wocmanid !== "0"
        ) {
          const [prod, wocman] = await Promise.all([
            Project.findByPk(project.projectid),
            User.findByPk(project.wocmanid),
          ]);

          if (prod && wocman) {
            const accept = parseInt(project.wocmanaccept);
            if (accept >= 0 && accept <= 4) {
              contacts.push({
                projectId: project.id,
                project: project.description,
                projectType: prod.name,
                wocmanName: `${wocman.firstname} ${wocman.lastname}`,
                wocmanEmail: wocman.email,
                wocmanPhone: wocman.phone,
                wocmanUsername: wocman.username,
                image: wocman.image,
                wocmanid: project.wocmanid,
                role: "wocman",
              });
            }
          }
        }
      }
    }

    return res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Found Chat Contacts",
      data: {
        accessToken: req.token,
        contacts,
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
