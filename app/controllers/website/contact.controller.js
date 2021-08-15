const pathRoot = '../../';
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
const ImageStore = db.imageStore;

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

exports.contactus = (req, res, next) => {

    var emailAddress =  req.body.email;
    var name =  req.body.name;
    var phone =  req.body.phone;
    var inquiry =  req.body.inquiry;
    var message =  req.body.message;
    const tracker = uuidv4();

    if (typeof emailAddress === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "email is undefined.",
                data: [] 
            }
        );
    }else{

        if (typeof name === "undefined") {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "name is undefined.",
                    data: []
                }
            );
        }else{
            if (typeof phone === "undefined") {
                return res.status(400).send(
                    {
                        statusCode: 400,
                        status: false,
                        message: "phone is undefined.",
                        data: []
                    }
                );
            }else{
                if (typeof inquiry === "undefined") {
                    return res.status(400).send(
                        {
                            statusCode: 400,
                            status: false,
                            message: "inquiry is undefined.",
                            data: []
                        }
                    );
                }else{
                    if (typeof message === "undefined") {
                        return res.status(400).send(
                            {
                                statusCode: 400,
                                status: false,
                                message: "message is undefined.",
                                data: []
                            }
                        );
                    }else{


                        const file = req.files;
                        const tracker = uuidv4();
                        if(typeof file === 'undefined'){

                        }else{
                            file.map((item) => {
                                let myFile =  item.originalname.split(".")
                                const fileType = myFile[myFile.length - 1]

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
                                            ImageStore.create(
                                                {
                                                    image: fileUrl,
                                                    tracker: tracker
                                                }
                                            );
                                        }
                                    }
                                });
                            });
                        }


                        Contactus.create({
                            name: name,
                            email: emailAddress,
                            phone: phone,
                            enquiry: inquiry,
                            message: message,
                            tracker: tracker
                        })
                        .then(hgh  => {
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: 'Successful message',
                                data: []
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
            }
        }
    }
};
