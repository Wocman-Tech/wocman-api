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
    if (typeof req.userId == "undefined") {
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

                if (!projects) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Schedule Not Found",
                        data: {
                            AccessToken: req.token,
                            Unboard: users.unboard
                        }
                    });
                }else{
                    var todaysDate = new Date();
                    for (let i = 0; i < projects.length; i++) {
                        //check/mmatch todays date
                        var rowDate =  new Date(projects[i].wocmanstartdatetime);
                        if (rowDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
                            send_row.push([
                                projects[i]
                            ]);
                        }
                    }
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

exports.producttype = (req, res, next) => {
    var projectid =  req.body.projectid;
    if(projectid && projectid !== ''){
        Searchuserid = {'id': projectid};
    }else{
        Searchuserid = {'id': {$not: null}};
    }

    Project.findAll({
        where: Searchuserid
    })
    .then(project => {
        if (!project) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "Wocman project type Not Found",
                data: {
                    AccessToken: req.token
                }
            });
        }else{
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Found a wocmam project type",
                data: {
                    Schedule: project,
                    AccessToken: req.token
                }
            });
        }
        
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

exports.projectCustomer = (req, res, next) => {
    var customerid =  req.body.customerid;

    if(customerid && customerid !== ''){
        Searchuserid = {'id': customerid};
    }else{
        Searchuserid = {'id': {$not: null}};
    }

    User.findAll({
        where: {'id': customerid}
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "Wocman project customer Not Found",
                data: {
                    AccessToken: req.token
                }
            });
        }else{
            //check if role is a customer role

            UserRole.findOne({
              where:  {'userid': customerid}
            })
            .then(userrole => {
                if (!userrole) {
                    res.status(403).send({
                        statusCode: 403,
                        status: false,
                        message: "Role not found",
                        data: []
                    });
                    return;
                }

                Role.findOne({
                  where:  {'id': userrole.roleid}
                })
                .then(roles => {
                    if (!roles) {
                        res.status(403).send({
                            statusCode: 403,
                            status: false,
                            message: "Require Customer Role!",
                            data: []
                        });
                        return;
                    }
                    if (roles.name == 'customer') {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Found a wocmam project customer",
                            data: {
                                customer: user,
                                AccessToken: req.token
                            }
                        });
                    }else{
                        return res.status(404).send({
                            statusCode: 404,
                            status: true,
                            message: "Found a user not customer",
                            data: {
                                AccessToken: req.token
                            }
                        });
                    }
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
        }
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