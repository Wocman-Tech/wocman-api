const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const AWS  = require('aws-sdk');
AWS.config.region = 'us-east-2';

const s3 = new AWS.S3({
    sslEnabled: true,
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey
})

const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const Nletter = db.nletter;
const Contactus = db.contactus;
const Cert = db.cert;
const Skills = db.skills;
const Wskills = db.wskills;
const Competency = db.competency;
const Wcompetency = db.wcompetency;
const Category = db.category;
const Wcategory = db.wcategory;
const Wrate = db.wrate;

const Projects = db.projects;
const Project = db.projecttype;
const Wshear = db.wshear;
const WAChat = db.waChat;
const WCChat = db.wcChat;
const WWallet = db.wWallet;
const wWalletH = db.wWalletH;
const WNotice = db.wNotice;

const urlExistSync = require("url-exist-sync");


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

exports.uploadProject = (req, res, next) => {
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: []
        });
    }else{

        var decription =  req.body.decription;
        var address =  req.body.address;
        var city =  req.body.city;
        var projecttypeid =  req.body.projecttypeid;
        // data cleaning

        //schema
        const joiClean = Joi.object().keys({ 
            decription: Joi.string(),
            address: Joi.string(),
            city: Joi.string(),
        }); 
        const dataToValidate = {
          decription: decription,
          address: address,
          city: city
        }
        const result = joiClean.validate(dataToValidate);
        if (result.error == null) {

            var customer_id =  req.userId;

            var project_id =  projecttypeid;//i want the admin to study this request and tie it to the appropriate project type.
            //inserting into the project table

            const file = req.files;//this are the files
            //be sure project never existed
            Projects.findOne(
                {
                    where: {
                        [Op.and]:[
                            {description: decription},
                            {projectid: project_id},
                            {customerid: customer_id}
                        ]
                    }
                }
            ).then(existProject => {
                if (!existProject) {

                    //create one
                    Projects.create({
                        description: decription,
                        address: address,
                        city: city,
                        projectid: project_id,
                        customerid: customer_id,
                        images: ''
                    })
                    .then(projectCallback  => {
                        var images = [];
                        file.map((item) => {
                            let myFile =  item.originalname.split(".")
                            const fileType = myFile[myFile.length - 1]
                            const dsf = uuidv4();

                            var params = {
                                ACL: "public-read-write",
                                Bucket: config.awsS3BucketName,
                                Key: item.originalname,
                                Body:  item.buffer
                            }

                            s3.upload(params, (error, data, res) => {
                                if(error){
                                    // res.status(500).send(error)
                                    console.log(error);
                                }else{
                                    var fileUrl = data.Location;
                                    if (typeof fileUrl === 'undefined') {
                                        //empty file
                                    }else{
                                        images.push({fileUrl});
                                    }
                                }
                                // console.log(images);
                                // save project
                                var all_image_url = '';
                                for (var i = 0; i < images.length; i++) {
                                    if (i == 0) {
                                        all_image_url =  images[i].fileUrl;
                                    }else{
                                        all_image_url = all_image_url + Helpers.padTogether() +  images[i].fileUrl;
                                    }
                                }
                                Projects.update(
                                    {
                                        images: all_image_url
                                    },
                                    {
                                        where: {'description': decription}
                                    }
                                );
                            });
                        });
                    
                        // return
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Project Created",
                            data: {
                                accessToken: req.token
                            }
                        });
                    })
                }else{
                    return res.status(400).send(
                    {
                        statusCode: 400,
                        status: false,
                        message: "Project Existed",
                        data: []
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
        }
    }
};

exports.projectTypes = (req, res, next) => {
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: []
        });
    }else{
        //synchronize project type with skills
        var skill_names = [];
        Skills.findAll()
        .then(skills => {
            if (!skills) {}else{
                if (!Array.isArray(skills) || !skills.length) {
                }else{
                    for (let i = 0; i < skills.length; i++) {
                        skill_names.push({
                            name: skills[i].name
                        })
                    }
                }
            }

            for (var if2 = 0; if2 < skill_names.length; if2++) {
                let skill2 = skill_names[if2]['name'];
                Project.findOne({
                    where : {'name': skill2 }
                })
                .then(projectTypes => {
                    if (projectTypes) {//already exist
                    }else{
                        //insert
                        Project.create({
                            name: skill2,
                            description: skill2
                        })
                    }
                });
            }

            Project.findAll()
            .then(projectNew => {
                if (!projectNew) {
                    return res.status(400).send(
                    {
                        statusCode: 400,
                        status: false,
                        message: "Projects Type was not found",
                        data: []
                    });
                }

                var customer_id =  req.userId;

                let jobs =  [];
                let jobtypes =  [];

                if (!projectNew) {}else{
                    if (!Array.isArray(projectNew) || !projectNew.length) {
                    }else{
                        for (let i = 0; i < projectNew.length; i++) {

                            if (typeof projectNew[i] == "undefined") {
                            }else{
                                jobtypes.push({
                                    jobTypeid: projectNew[i].id,
                                    description: projectNew[i].description,
                                    name: projectNew[i].name
                                })
                            }
                        }
                    }
                }

                if(req.userId && req.userId !== ''){
                    Searchuserid = {'customerid': req.userId};
                }else{
                    Searchuserid = {'customerid': {$not: null}};
                }

                
                Projects.findAll({
                    where: Searchuserid
                })
                .then(projects => {
                    if (!projects) {}else{
                        if (!Array.isArray(projects) || !projects.length) {
                        }else{
                            for (let i = 0; i < projects.length; i++) {

                                if (typeof projects[i] == "undefined") {
                                }else{
                                    if (parseInt(projects[i].wocmanid, 10) > 0 && parseInt(projects[i].projectcomplete, 10) != 1) {
                                        jobs.push({
                                            description: projects[i].description,
                                            wocmanid: projects[i].wocmanid,
                                            images: projects[i].images,
                                            jobTypeid: projects[i].projectid,
                                            jobid: projects[i].id
                                        })
                                    }
                                }
                            }
                        }
                    }
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Jobs And Job Types",
                        data: {
                            accessToken: req.token,
                            jobs: jobs,
                            jobTypes: jobtypes
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
