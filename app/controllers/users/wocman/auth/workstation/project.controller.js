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

const urlExistSync = require("url-exist-sync");

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
exports.wocmanProjectProject = (req, res, next) => {
    // Username
    // var projectid =  req.body.projectid;
    var projectid =  req.params.projectid;    
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "project  is undefined.",
                data: []
            }
        );

    }else{
        //schema
        const joiClean = Joi.object().keys({ 
            projectid: Joi.number().integer().min(1), 
        }); 
        const dataToValidate = { 
          projectid: projectid 
        }
        // const result = Joi.validate(dataToValidate, joiClean);
        const result = joiClean.validate(dataToValidate);
        if (result.error == null) {
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
                Projects.findByPk(projectid).then(project => {
                    if (!project) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        Project: "Project Not Found",
                        data: []
                      });
                      return;
                    }
                    if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project  Owner not resolved",
                            data: []
                        });
                    }

                    var wpCustomer = [];
                    var isCustomer = project.customerid;
                    User.findByPk(isCustomer).then(customeruser => {
                        if (customeruser) {
                            wpCustomer.push(
                                
                                {
                                    custmer_id: customeruser.id,
                                    custmer_username: customeruser.username,
                                    custmer_firstname: customeruser.firstname,
                                    custmer_lastname: customeruser.lastname,
                                    custmer_phone: customeruser.phone,
                                    custmer_email: customeruser.email,
                                    custmer_address: customeruser.address,
                                    custmer_country: customeruser.country,
                                    custmer_image: customeruser.image
                                }
                                
                            );
                        }
                    })
                    if (parseInt(project.wocmanaccept, 10) == 0) {
                        var project_status = 'Unaccessed';
                    }
                    if (parseInt(project.wocmanaccept, 10) == 1) {
                        var project_status = 'Rejected';
                    }
                    if (parseInt(project.wocmanaccept, 10) == 2) {
                        var project_status = 'Accepted';
                    }
                    if (parseInt(project.wocmanaccept, 10) == 3) {
                        var project_status = 'Started';
                    }
                    if (parseInt(project.wocmanaccept, 10) == 4) {
                        var project_status = 'Completed';
                    }
                    if (parseInt(project.wocmanaccept, 10) == 5) {
                        var project_status = 'Verified';
                    }

                    Project.findByPk(project.projectid).then(projecttype => {
                        if (!projecttype) {
                          res.status(404).send({
                             statusCode: 404,
                            status: false,
                            message: "Project Type Not Found",
                            data: []
                          });
                          return;
                        }
                        var project_images = [];
                        if (typeof project == "undefined") {
                        }else{

                            if (project.images == null) {
                                                
                            }else{
                                if (project.images == 'null') {
                                   
                                }else{
                                    var ppp = (project.images).split(Helpers.padTogether());
                                    for (let i = 0; i <  ppp.length; i++) {
                                        var linkExist =  urlExistSync(project.images);

                                        if (linkExist === true) {
                                            var theimage = project.images;
                                            project_images.push(
                                                [
                                                   theimage 
                                                ]
                                            );
                                        }  
                                    }
                                }
                            }
                        }

                        
                        res.send({
                            project: project.project,
                            project_id: project.id,
                            project_description: project.description,
                            project_location: project.address+" "+project.city,
                            project_schedule: project.datetimeset,
                            project_type: projecttype.name,
                            project_images: project_images,
                            project_status: project_status,
                            customer: wpCustomer,
                            accessToken: req.token
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
            })
            .catch(err => {
                res.status(500).send({
                    statusCode: 500,
                    status: false, 
                    message: err.message,
                    data: [] 
                });
            });
        }else{
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "Invali Projectid",
                    data: []
                }
            );
        }
    }
};
