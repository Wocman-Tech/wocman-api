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
const Wcategory = db.wcategory;
const Category = db.category;

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

exports.wocmanAddSkill = (req, res, next) => {
    var skillid =  req.body.skillid;
    var description =  req.body.description;

    if (typeof skillid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "skillid  field is undefined.",
                data: [] 
            }
        );
    }
    if (typeof description === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "description field is undefined.",
                data: []
            }
        );
    }
   
    
    if(req.userId && req.userId !== ''){
        var user_id = req.userId;
    }else{
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User could not be verified",
            data: [] 
        });
    }

    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: "User Not found.",
                data:[]
            });
        }

        Skills.findOne({
            where: {'id' : skillid}
        }).then(ds34drsd => {
            if (!ds34drsd) {
            	return res.status(404).send({
	                statusCode: 400,
	                status: false,
	                message: "Skill does not exist",
	                data:[]
	            });
            }
            var category_id = ds34drsd.categoryid;

            Wcategory.findOne({
                where: {'userid' : user_id, 'categoryid': category_id}
            }).then(ffdfdfcategry => {
                if (!ffdfdfcategry) {
                    return res.status(404).send({
                        statusCode: 400,
                        status: false,
                        message: "This skill does not match your wocman category if any!",
                        data:[]
                    });
                }
                Wskills.findOne({
    	            where: {'skillid' : skillid, 'userid': user_id}
    	        }).then(ds34dsd => {
    	            if (ds34dsd) {
    	            	return res.status(404).send({
    		                statusCode: 400,
    		                status: false,
    		                message: "Skill added already",
    		                data:[]
    		            });
    	            }
    	            Wskills.create({
    	                userid: user_id,
    	                skillid: skillid,
    	                description: description
    	            })
    	            .then(hgh  => {

    	                const pushUser = user_id;
    	                const pushType = 'service';
    	                const pushBody = 'Dear ' + users.username + ", <br />You have added " +
    	                                "a Skill. <br /> This would be reviewed soon " +
    	                                "<br />A corresponding response would be sent to you<br/>";

    	                Helpers.pushNotice(pushUser, pushBody, pushType);

    	                User.update(
    	                    {isSkilled: 1},
    	                    {where: {id: user_id} }
    	                );
    	                res.status(200).send({
    	                    statusCode: 200,
    	                    status: true,
    	                    message: "Skill was added",
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

exports.wocmanListSkills = (req, res, next) => {
    if(req.userId && req.userId !== ''){
        var user_id = req.userId;
    }else{
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User could not be verified",
            data: [] 
        });
    }

    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: "User Not found.",
                data:[]
            });
        }
        Wcategory.findOne({
            where: {'userid' : user_id}
        }).then(ffdfdfcategry => {
            if (!ffdfdfcategry) {
                return res.status(404).send({
                    statusCode: 400,
                    status: false,
                    message: "Create Category First",
                    data:[]
                });
            }
            var category_id = ffdfdfcategry.categoryid;
            Category.findOne({
                where: {'id': category_id}
            })
            .then(isCategory => {
                if (!isCategory) {
                    var categoryName = '';
                }else{
                    var categoryName = isCategory.name;
                }
                Skills.findAll({
                    where : {categoryid: category_id}
                }).then(fgrtyrtyfgf => {
                    if (!fgrtyrtyfgf) {
                    	return res.status(404).send({
        	                statusCode: 400,
        	                status: false,
        	                message: "Skill does not exist",
        	                data:[]
        	            });
                    }
                    
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Skill was found",
                        data: {
                            category: categoryName,
                        	skills: fgrtyrtyfgf,
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