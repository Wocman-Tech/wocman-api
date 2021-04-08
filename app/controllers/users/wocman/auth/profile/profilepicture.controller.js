const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const AWS  = require('aws-sdk');
AWS.config.region = 'us-east-2';

const s3 = new AWS.S3({
    sslEnabled: true,
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})
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
var bu7 = false;
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

exports.uploadProfilePictureWocman =  (req, res, next) => {

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
    const file = req.file;//this is the file name
    if (!file) {
        return res.status(400).send({
            statusCode: 400,
            status: false,
            message: "avatar filed was undefined",
            data: []
        });
    }
    // console.log(file);
    let myFile =  file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]
    const dsf = uuidv4();

    const params = {
        ACL: "public-read-write",
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${dsf}.${fileType}`,
        Body:  file.buffer
    }

    s3.upload(params, (error, data) => {
        if(error){
            res.status(500).send(error)
        }

        // res.status(200).send(data)
        var fileUrl = data.Location;
        if (typeof fileUrl === 'undefined') {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Upload Not successful",
                data: []
            });
        }
       
        User.findByPk(user_id).then(users => {
            if (!users) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    date: []
                });
            }
            users.update({
                image: fileUrl,
                images: users.images+Helpers.padTogether()+fileUrl
            })
            .then( () => {
                res.send({
                    statusCode: 200,
                    status: true,
                    message: "Profile picture uploaded successfully",
                    data: {
                        imageUrl: fileUrl,
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
    });
};