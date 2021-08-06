const pathRoot = '../../../../../';

const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const Nletter = db.nletter;
const Contactus = db.contactus;
const Cert = db.cert;


const Projects = db.projects;
const Project = db.projecttype;
const Wshear = db.wshear;
const WAChat = db.waChat;
const WCChat = db.wcChat;
const WWallet = db.wWallet;

const {v4 : uuidv4} = require('uuid');
const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");

let nodeGeocoder = require('node-geocoder');
 
let options = {
  provider: 'openstreetmap'
};


const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const Joi = require('joi'); 

const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

let transporter = nodemailer.createTransport({
  service: config.message_server,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: config.name,
    link: config.website,
  },
});




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
        Projects.findAll({
            where: {wocmanid: req.userId}
        }).then(projectBase => {
            var customers = [];
            if (!projectBase) {
              res.status(404).send({
                statusCode: 404,
                status: false,
                message: "Project Not Found",
                data: []
              });
              return;
            }
            for (var i = 0; i < projectBase.length; i++) {
                
                if (parseInt(projectBase[i].wocmanaccept) > 1 && parseInt(projectBase[i].wocmanaccept) < 5) {

                    customers.push({
                        customerid: projectBase[i].customerid 
                        projectid: projectBase[i].projectid,
                        project: projectBase[i].description
                    })
                }
            }
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Found Current Projects Customers",
                data: {
                    accessToken: req.token,
                    customers: customers,
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
