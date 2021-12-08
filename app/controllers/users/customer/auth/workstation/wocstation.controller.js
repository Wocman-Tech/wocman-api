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
const Skills = db.skills;
const Wskills = db.wskills;
const Category = db.category;
const Wcategory = db.wcategory;

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
exports.wocstation_details = (req, res, next) => {
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
                Projects.findByPk(projectid).then(async project => {
                    if (!project) {
                        res.status(404).send({
                            statusCode: 404,
                            status: false,
                            Project: "Project Not Found",
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

                        var wpWocman = [];

                        var wpProjectr = [];
                        if (parseInt(project.wocmanaccept, 10) == 1) {
                            var wocmanAccept = true;
                        }else{
                            var wocmanAccept = false;
                        }

                        if (parseInt(project.customerstart, 10) == 1) {
                            var customerstart = true;
                        }else{
                            var customerstart = false;
                        }

                        if (parseInt(project.customeracceptcomplete, 10) == 1) {
                            var customeracceptcomplete = true;
                        }else{
                            var customeracceptcomplete = false;
                        }

                        if (parseInt(project.projectcomplete, 10) == 1) {
                            var projectcomplete = true;
                        }else{
                            var projectcomplete = false;
                        }
                        User.findByPk(project.wocmanid).then(wocman_project_user => {

                            // Make sure to wait on all your sequelize CRUD calls
                            Wskills.findAll({ where:{'userid': project.wocmanid}}).then(async skills => {

                                for await (const skill of skills){


                                    const skill_now = await Skills.findByPk(skill.id)
                                    
                                    const category = await Category.findByPk(skill_now.categoryid)

                                    let cartItem3 = {}

                                    cartItem3.wocman_username = wocman_project_user.username,
                                    cartItem3.wocman_name = wocman_project_user.firstname+ " " +wocman_project_user.lastname,
                                    cartItem3.wocman_phone = wocman_project_user.phone,
                                    cartItem3.wocman_email = wocman_project_user.email,
                                    cartItem3.wocman_address = wocman_project_user.address,
                                    cartItem3.wocman_country = wocman_project_user.country,
                                    cartItem3.wocman_image = wocman_project_user.image,
                                    cartItem3.wocman_skill_category = category.name,
                                    cartItem3.wocman_skill_name = skill_now.name,
                                    cartItem3.wocman_skill_description = skill_now.description
                                   
                                    wpWocman.push(cartItem3)
                                }
                                var wpCustomer = [];
                                wpCustomer.push(
                                    [
                                        {
                                            customer_username: user.username,
                                            customer_firstname: user.firstname,
                                            customer_lastname: user.lastname,
                                            customer_phone: user.phone,
                                            customer_image: user.image
                                        }
                                    ]
                                );
                                wpProjectr.push(
                                    [
                                        {
                                            id: project.id,
                                            project_type_name: projecttype.name,
                                            project_type_description: projecttype.description,
                                            project: project.project,
                                            project_description: project.description,
                                            project_address: project.address,
                                            project_city: project.city,
                                            project_date_schedule: project.datetimeset,
                                            project_country: project.country,
                                            project_state: project.state,
                                            Project_Images: project.images,
                                            project_quotation_amount: project.quoteamount,
                                            project_isWocmanAccept: wocmanAccept,
                                            project_wocmanStartDate: project.wocmanstartdatetime,
                                            project_isCustomerAcceptStart: customerstart,
                                            project_customerReports: project.projectreport,
                                            project_wocmanStopDate: project.wocmanstopdatetime,
                                            project_isCustomerAcceptComplete: customeracceptcomplete,
                                            project_CustomerRateWocman: project.customerratewocman,
                                            project_adminProjectComplete: projectcomplete,
                                            Project_created_on: project.createdAt
                                        }
                                    ]
                                );

                                res.send({
                                    accessToken: req.token,
                                    project: wpProjectr,
                                    Wocman: wpWocman,
                                    Customer: wpCustomer
                                });
                            })
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
