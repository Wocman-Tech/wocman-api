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
const Rootadmin = db.rootadmin;
const Account = db.accounts;
const Wrate = db.wrate;


const Projects = db.projects;
const Project = db.projecttype;
const Wshear = db.wshear;
const WAChat = db.waChat;
const WCChat = db.wcChat;
const WWallet = db.wWallet;
const WwWalletH = db.wWalletH;
const Wipblacklist = db.ipblacklist;
const WwNotice = db.wNotice;
const Wwsetting = db.wsetting;

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

exports.adminclose = (req, res, next) => {
    if(req.body.userId && req.body.userId !== ''){
        var user_id = req.body.userId;
    }else{
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "Include the userId Field",
            data: []
        });
    }
    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                data: []
            });
        }
        if (req.isprofile == 0) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "Unauthorized admin",
                data: []
            });
        }
        const pushUser = users.id;
        const pushType = 'service';
        const pushBody = 'Dear ' + users.username + ", <br />Your account has been closed. " +
                        "<br /> Thank you for working with us and thanks for your cooperation " +
                        "<br />We Shall therefore clear all your data in our database";

        Helpers.pushNotice(pushUser, pushBody, pushType);

        Cert.destroy({
            where: {'userid': user_id}
        });
        UserRole.destroy({
            where: {'userid': user_id}
        });
        Projects.destroy({
            where: {'customerid': user_id}
        });
        Wipblacklist.destroy({
            where: {'userid': user_id}
        });
        WAChat.destroy({
            where: {'senderid': user_id}
        });
        WAChat.destroy({
            where: {'receiverid': user_id}
        });
        WCChat.destroy({
            where: {'senderid': user_id}
        });
        WCChat.destroy({
            where: {'receiverid': user_id}
        });
        WWallet.destroy({
            where: {'userid': user_id}
        });
        WwNotice.destroy({
            where: {'userid': user_id}
        });
        Wwsetting.destroy({
            where: {'userid': user_id}
        });
        WwWalletH.destroy({
            where: {'userid': user_id}
        });
        Wrate.destroy({
            where: {'userid': user_id}
        });
        User.destroy({
            where: {'id': user_id}
        });

        Account.destroy({
            where: {'customervetadminid': user_id}
        });
        Account.destroy({
            where: {'wocmanvetadminid': user_id}
        });
        Account.destroy({
            where: {'closeaccountvetadminid': user_id}
        });
        Rootadmin.destroy({
            where: {'email': users.email}
        });
        
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "User Removed Entirely",
            data: {
                accessToken: null
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
};