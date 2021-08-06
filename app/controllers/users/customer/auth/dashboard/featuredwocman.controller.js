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

//changes(04/08/2021)
//added  defaultValue: 'nigeria' for country field in projects.model.js
//added  featured field in user.model.js
           
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

            var images = [];
            var project_id =  projecttypeid;//i want the admin to study this request and tie it to the appropriate project type.
            //inserting into the project table

            const file = req.files;//this are the files

            file.map((item) => {
                let myFile =  item.originalname.split(".")
                const fileType = myFile[myFile.length - 1]
                const dsf = uuidv4();

                const params = {
                    ACL: "public-read-write",
                    Bucket: config.awsS3BucketName,
                    Key: `${dsf}.${fileType}`,
                    Body:  item.buffer
                }

                s3.upload(params, (error, data) => {
                    if(error){
                        // res.status(500).send(error)
                    }
                    var fileUrl = data.Location;
                    if (typeof fileUrl === 'undefined') {
                        //empty file
                    }else{
                        images.push(data.Location);
                    }
                });
            });
            // save project
            var all_image_url = '';
            for (var i = 0; i < images.length; i++) {
                if (1 == 0) {
                    all_image_url =  images[i];
                }else{
                    all_image_url = all_image_url + Helpers.padTogether()+  images[i];
                }
            }

            //create one
            Projects.create({
                description: decription,
                address: address,
                city: city,
                projectid: project_id,
                customerid: customer_id,
                images: all_image_url
            })
            .then(hgh  => {
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
        }
    }
};
exports.listProject = (req, res, next) => {
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: []
        });
    }else{
        var customer_id =  req.userId;

        let jobs =  [];

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
                        if (parseInt(projects.wocmanid, 10) > 0 && parseInt(projects.projectcomplete, 10) != 1) {
                            jobs.push({
                                description: projects.description,
                                wocmanid: projects.wocmanid,
                                projectid: projects.projectid,
                                images: projects.images
                            })
                            console.log(jobs);
                        }
                    }
                }
            }
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Jobs",
                data: {
                    accessToken: req.token,
                    jobs: jobs
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

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "jobType",
                    data: {
                        accessToken: req.token,
                        jobType: projectNew
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

    }
};
exports.wocmanDetails = (req, res, next) => {
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: []
        });
    }else{
        var wocman_details = [];

        User.findAll({
            where: {'featured': '1'}
        })
        .then(userc => {

            if (!(userc)) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false, 
                    message: 'Could not Find Featured wocman',
                    data: [] 
                });
            }

            if (!Array.isArray(userc) || !userc.length) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false, 
                    message: 'Could not Find Featured wocman',
                    data: [] 
                });
            }else{
                for (let i = 0; i < userc.length; i++) {

                    var wocman_picture = '';
                    if (userc[i].image == null) {}else{
                        if (userc[i].image == 'null') {}else{
                            var linkExist =  urlExistSync(userc[i].image);
                            if (linkExist === true) {
                                wocman_picture = userc[i].image;
                            }
                        }
                    }


                    var searchuserid = {'userid': userc[i].id};//wocmen
                    UserRole.findOne({
                        where: searchuserid
                    })
                    .then(dUserRole => {
                        
                        if (!dUserRole) {
                            
                        }
                        let searchuserid1 = {'userid': userc[i].id};
                        if (parseInt(dUserRole.roleid, 10) == 2) {

                            var rateUser = 0;
                            var rateUserCount = 0;
                            var rateUserWocman  = 0;
                            Wrate.findAll({
                                where: searchuserid1
                            })
                            .then(wrate => {
                                if (!wrate) {}else{
                                    if (!Array.isArray(wrate) || !wrate.length) {
                                    }else{
                                        for (let i1 = 0; i1 < wrate.length; i1++) {
                                            rateUserCount = rateUserCount + 1;
                                            rateUser = rateUser + parseInt(wrate[i1].rateUser, 10);
                                        }
                                    }
                                }
                            });
                            if (rateUser > 0 && rateUserCount > 0) {
                                rateUserWocman = rateUser/rateUserCount;
                            }else{
                                rateUserWocman = 0;
                            }


                            var skills = "";
                            Skills.findAll()
                            .then(skillsg6 => {
                                if (!skillsg6) {}else{
                                    if (!Array.isArray(skillsg6) || !skillsg6.length) {
                                    }else{
                                        for (var i2 = 0; i2 < skillsg6.length; i2++) {

                                            const skillname = skillsg6[i2].name;
                                            var skillid = skillsg6[i2].id;
                                            var category_id = skillsg6[i2].categoryid;
                                            let searchuserid2 = {'userid': userc[i].id, 'skillid': skillid};

                                            Wskills.findOne({
                                                where: searchuserid2
                                            })
                                            .then(wskills => {
                                                if (!wskills) {}else{
                                                    if ('dataValues' in wskills) {
                                                        var skillsId = wskills.id;
                                                        var description = wskills.description;
                                                        Category.findOne({
                                                            where: {id: category_id}
                                                        })
                                                        .then(wcategory => {
                                                            if (!wcategory) {}else{
                                                                if ('dataValues' in wcategory) {
                                                                    skills = skillname;
                                                                }
                                                            } 
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });

                            wocman_details.push(
                                {
                                    name: userc[i].firstname + " " +userc[i].lastname,
                                    picture: wocman_picture,
                                    rate: rateUserWocman,
                                    skill: skills
                                }
                            );
                        }
                        // console.log(wocman_details);
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Featured wocman user",
                            data: {
                                featured: wocman_details,
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
};
