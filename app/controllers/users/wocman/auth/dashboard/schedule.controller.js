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
            var unboard = Helpers.returnBoolean(users.unboard);

            if(req.userId && req.userId !== ''){
                Searchuserid = {'userid': req.userId};
                Searchwocmanid = {'wocmanid': req.userId};
            }else{
                Searchuserid = {'userid': {$not: null}};
                Searchwocmanid = {'wocmanid': {$not: null}};
            }
            const promiseInvoices = [];
            Projects.findAll({
                where: Searchwocmanid
            })
            .then(async  projects => {
                var send_row = [];

                if (!projects) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Schedule Not Found",
                        data: {
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }
                var todaysDate = new Date();
                for await (const project of projects){
                    //check/mmatch todays date
                    var rowDate =  new Date(project.datetimeset);
                    if (rowDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
                        // console.log("YES");

                        // Make sure to wait on all your sequelize CRUD calls
                        const prod = await Project.findByPk(project.projectid)

                        // It will now wait for above Promise to be fulfilled and show the proper details
                        console.log(prod)

                        const cust = await User.findByPk(project.customerid)

                        // It will now wait for above Promise to be fulfilled and show the proper details
                        console.log(cust)

                        let cartItem3 = {}
                        const customer_name = cust.firstname +" "+ cust.lastname

                        cartItem3.projectId = project.id
                        cartItem3.project = project.description
                        cartItem3.schedule = project.datetimeset
                        cartItem3.projectType = prod.name
                        cartItem3.customer = customer_name
                       
                        // Simple push will work in this loop, you don't need to return anything
                        promiseInvoices.push(cartItem3)
                    }
                }
               
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found a wocmna user",
                    data: {
                        schedule: promiseInvoices,
                        accessToken: req.token,
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
                    accessToken: req.token
                }
            });
        }else{
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Found a wocmam project type",
                data: {
                    schedule: project,
                    accessToken: req.token
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
                    accessToken: req.token
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
                                accessToken: req.token
                            }
                        });
                    }else{
                        return res.status(404).send({
                            statusCode: 404,
                            status: true,
                            message: "Found a user not customer",
                            data: {
                                accessToken: req.token
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