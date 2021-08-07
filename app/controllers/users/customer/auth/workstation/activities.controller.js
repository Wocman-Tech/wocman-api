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
const Wrate = db.wrate;

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

exports.startProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
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
                            message: "Project Not Found",
                            data: []
                        });
                        return;
                    }
                    if (parseInt(project.customerid, 10) !== parseInt(req.userId, 10)) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project  Owner not resolved",
                            data: []
                        });
                    }else{
                        Projects.update(
                        {
                            customerstart:1
                        },
                        {
                            where: {'projectid': projectid}
                        }
                        ).then(() => {
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Project Started",
                                data: {
                                    accessToken: req.token
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
    }
};
exports.completeProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
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
                            message: "Project Not Found",
                            data: []
                        });
                        return;
                    }
                    if (parseInt(project.customerid, 10) !== parseInt(req.userId, 10)) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project  Owner not resolved",
                            data: []
                        });
                    }else{
                        Projects.update(
                        {
                            customeracceptcomplete:1
                        },
                        {
                            where: {'projectid': projectid}
                        }
                        ).then(() => {
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Project Completed",
                                data: {
                                    accessToken: req.token
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
    }
};
exports.rateProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    var projectrate =  req.body.rate;
    
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
                            message: "Project Not Found",
                            data: []
                        });
                        return;
                    }
                    if (parseInt(project.customerid, 10) !== parseInt(req.userId, 10)) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project  Owner not resolved",
                            data: []
                        });
                    }else{
                        Projects.update(
                        {
                            customerratewocman:projectrate
                        },
                        {
                            where: {'projectid': projectid}
                        }
                        ).then(() => {

                            Wrate.destroy(
                                {
                                    where: {jobid: projectid}
                                }
                            );

                            Wrate.create(
                            {
                                userid: project.wocmanid,
                                jobid: projectid,
                                rateUser: projectrate 
                            });

                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Project Rated "+projectrate,
                                data: {
                                    accessToken: req.token
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
    }
};
exports.reportProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    var projectreport =  req.body.report;
    
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

        if (typeof projectreport === "undefined") {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "report field  is undefined.",
                    data: [] 
                }
            );
        }

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
                            message: "Project Not Found",
                            data: []
                        });
                        return;
                    }
                    if (parseInt(project.customerid, 10) !== parseInt(req.userId, 10)) {
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project  Owner not resolved",
                            data: []
                        });
                    }else{
                        var newReport = project.report+"<br/><hr><br/>"+projectreport;
                        Projects.update(
                        {
                            projectreport:newReport
                        },
                        {
                            where: {'projectid': projectid}
                        }
                        ).then(() => {
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Project Reported",
                                data: {
                                    accessToken: req.token
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
    }
};