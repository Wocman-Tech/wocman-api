const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Skills = db.Skills;
const Wskills = db.Wskills;

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
            .then(async userc => {

                var wocman_picture = '';

                var rateUser = 0;
                var rateUserCount = 0;
                var rateUserWocman  = 0;
                var skillname = '';

                for await (const each_userc of userc){

                    let cartItem3 = {}

                    if (each_userc.image == null) {}else{
                        if (each_userc.image == 'null') {}else{
                            var linkExist =  urlExistSync(each_userc.image);
                            if (linkExist === true) {
                                wocman_picture = each_userc.image;
                            }
                        }
                    }

                    const user_role = await UserRole.findOne({ where: {'userid': each_userc.id} });
                    if (parseInt(user_role.roleid, 10) == 2) {

                        const user_rate = await Wrate.findAll({ where: {'userid': each_userc.id} });
                        for await (const each_rate of user_rate){
                            rateUserCount = rateUserCount + 1;
                            rateUser = rateUser + parseInt(each_rate.rateUser, 10);
                        }
                    }

                    if (rateUser > 0 && rateUserCount > 0) {
                        rateUserWocman = rateUser/rateUserCount;
                    }else{
                        rateUserWocman = 0;
                    }

                    const user_skill = await Wskills.findAll({ where: {'userid': each_userc.id} });
                    for await (const each_skill of user_skill){
                        const skill = await Skills.findAll({ where: {'id': each_skill.skillid} });
                        skillname = skill.name;
                    }

                    cartItem3.name = each_userc.firstname+' '+each_userc.lastname,
                    cartItem3.picture = wocman_picture,
                    cartItem3.rate = rateUserWocman,
                    cartItem3.skill = skillname

                    wocman_details.push(cartItem3);
                }
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