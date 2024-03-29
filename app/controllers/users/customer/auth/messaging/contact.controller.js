const pathRoot = '../../../../../';

const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const User = db.User;
const Projects = db.Projects;
const Project = db.Projecttype;

const {v4 : uuidv4} = require('uuid');
const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");



const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// chat routes
exports.wocmanChatContact = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        if (!user) {
            res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not Found",
                data: []
            });
            return;
        }
        var unboard = Helpers.returnBoolean(user.unboard);
        const wocmen = [];

        Projects.findAll({
            where: {customerid: req.userId}
        }).then(async projectBase => {
            if (!projectBase) {
                res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Project Not Found",
                    data: []
                });
                return;
            }

            for await (const project of projectBase){

                // Make sure to wait on all your sequelize CRUD calls
                const prod = await Project.findByPk(project.projectid)

                // It will now wait for above Promise to be fulfilled and show the proper details
                console.log(prod)

                const cust = await User.findByPk(project.wocmanid)

                // It will now wait for above Promise to be fulfilled and show the proper details
                console.log(cust)

                let cartItem3 = {}
                const customer_name = cust.firstname +" "+ cust.lastname

                cartItem3.projectId = project.projectid
                cartItem3.project = project.description
                cartItem3.projectType = prod.name
                cartItem3.customerName = customer_name
                cartItem3.customerEmail = cust.email
                cartItem3.customerPhone = cust.phone
                cartItem3.customerUsername = cust.username,
                cartItem3.image = cust.image,
                cartItem3.wocmanid = project.wocmanid

               
                // Simple push will work in this loop, you don't need to return anything
                if (parseInt(project.wocmanaccept) > 1 && parseInt(project.wocmanaccept) < 5) {
                    wocmen.push(cartItem3)
                }
            }
            
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Found Current Projects Wocman",
                data: {
                    accessToken: req.token,
                    wocmen: wocmen,
                    unboard: unboard
                }
            });
        })
        .catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    })
    .catch(err => {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};
