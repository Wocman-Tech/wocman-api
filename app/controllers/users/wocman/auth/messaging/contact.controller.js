const pathRoot = "../../../../../";

const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const fs = require("fs");
const User = db.User;
const Project = db.Projects;
const ProjectType = db.Projecttype;

const { v4: uuidv4 } = require("uuid");
const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");

// chat routes
exports.wocmanChatContact = async (req, res, next) => {
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

    const projects = await Project.findAll({
      where: { wocmanid: req.userId },
      include: [
        {
          model: ProjectType,
          as: "project_subcategory",
          attributes: ["name"],
        },
        {
          model: User,
          as: "customer",
          attributes: [
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "username",
            "image",
          ],
        },
      ],
    });

    if (!projects || projects.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "No Projects Found",
        data: [],
      });
    }



    const customers = projects
      .filter(
        (project) =>
          parseInt(project.wocmanaccept) < 5 &&
          project.customer &&
          project.project_subcategory
      )
      .map((project) => ({
        projectId: project.projectid,
        project: project.description,
        projectType: project.project_subcategory.name,
        customerName: `${project.customer.firstname} ${project.customer.lastname}`,
        customerEmail: project.customer.email,
        customerPhone: project.customer.phone,
        customerUsername: project.customer.username,
        image: project.customer.image,
        customerId: project.customerid,
      }));

    return res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Found Current Projects Customers",
      data: {
        accessToken: req.token,
        customers,
        unboard,
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).send({
      statusCode: 500,
      status: false,
      message: "Internal Server Error: " + err.message,
      data: [],
    });
  }
};
