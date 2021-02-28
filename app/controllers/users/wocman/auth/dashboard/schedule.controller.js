const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.user;
const Role = db.role;
const UserRole = db.userRole;

const Projects = db.projects;
const Project = db.projecttype;


const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const {v4 : uuidv4} = require('uuid');
const Joi = require('joi'); 
let nodeGeocoder = require('node-geocoder');
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
 
let options = {
  provider: 'openstreetmap'
};

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


exports.schedule = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.userId, 10) === 1) {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        User.findByPk(req.userId)
        .then(users => {
            if (!users) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    data: []
                });
            }
            if(req.userId && req.userId !== ''){
                Searchuserid = {'userid': req.userId};
                Searchwocmanid = {'wocmanid': req.userId};
            }else{
                Searchuserid = {'userid': {$not: null}};
                Searchwocmanid = {'wocmanid': {$not: null}};
            }
            Projects.findAll({
                where: Searchwocmanid
            })
            .then(projects => {
                var send_row = [];
                var projectType = '';

                if (!projects) {}else{

                    var todaysDate = new Date();
                    for (let i = 0; i < projects.length; i++) {
                        //check/mmatch todays date
                        var rowDate =  new Date(projects[i].wocmanstartdatetime);
                        if (rowDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
                            
                            Project.findAll({
                                where: {'id': projects[i].projectid}
                            })
                            .then(project => {
                                if (!project) {}else{
                                    projectType = project;
                                }
                                send_row.push([
                                    projects[i],
                                    projectType
                                ]);
                                res.status(200).send({
                                    statusCode: 200,
                                    status: true,
                                    message: "Found a wocmna user",
                                    data: {
                                        Schedule: send_row,
                                        AccessToken: req.token,
                                        Unboard: users.unboard
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
                        }
                    }
                }
            })
            .catch(err => {
                res.status(500).send({
                    statusCode: 500,
                    status: false, 
                    message: err.message,
                    data: [] 
                });
            })
        })
        .catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });        
    }
};