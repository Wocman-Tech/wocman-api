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
const Skills = db.skills;
const Wskills = db.wskills;
const Competency = db.competency;
const Wcompetency = db.wcompetency;
const Category = db.category;
const Wcategory = db.wcategory;

const urlExistSync = require("url-exist-sync");


const Projects = db.projects;
const Project = db.projecttype;
const Wshear = db.wshear;
const WAChat = db.waChat;
const WCChat = db.wcChat;
const WWallet = db.wWallet;
const wWalletH = db.wWalletH;
const Wrate = db.wrate;
const WNotice = db.wNotice;

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


exports.customerNav = (req, res, next) => {
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
            var currentImage = [];
            
            if (users.image == null) {}else{
                if (users.image == 'null') {}else{
                    var linkExist =  urlExistSync(users.image);
                    if (linkExist === true) {
                        var theimaeg = users.image;
                        currentImage.push(
                            [
                                theimaeg
                            ]
                        );
                    }
                }
            }
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            var authorities = 'customer';

            var wocman_details = [];

            User.findAll({
                where: {'featured': '1'}
            })
            .then(userc => {

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
                    });
                }
            });

            var details = [];
            details.push(
                {
                    username: users.username,
                    email: users.email,
                    firstname: users.firstname,
                    lastname: users.lastname,
                    profile_picture: currentImage,
                    isEmailVerified: isEmailVerified,
                    isProfileUpdated: isProfileUpdated,
                    unboard: unboard
                }
            );
            // console.log(wocman_details);
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Customer Details",
                data: {
                    customer: details,
                    featured_wocman: wocman_details,
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
};