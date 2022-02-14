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
const ImageStore = db.ImageStore;

const Nletter = db.Nletter;

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

exports.AllNewsletter = (req, res, next) => {
    Nletter.findAndCountAll()
    .then(result => {
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Found news letters",
            data: result.rows
        });
    })
    .catch((err)=> {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.oneNewsletter = (req, res, next) => {
    var id =  req.params.id;
    Nletter.findByPk(id)
    .then(result => {
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Found news letters",
            data: result
        });
    })
    .catch((err)=> {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.deleteNewsletter = (req, res, next) => {
    var ids = req.params.id;
    Nletter.destroy({
        where: {id: ids}
    })
    .then(result => {
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Deleted news letters",
            data: []
        });
    })
    .catch((err)=> {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

exports.sendNewsletter = (req, res, next) => {
    var text = req.body.text;
    var subject = req.body.subject;

    if (text && text !== '') {
    }else{
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "Include text field",
            data: [] 
        });
    }

    if(subject && subject !== ''){
    }else{
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,   
            message: "Include the subject field",
            data: []
        });
    }

    const file = req.files;
    const tracker = uuidv4();
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

    Nletter.findAll({
    })
    .then(result => {
        if (result) {
            for (var i = 0; i < result.length; i++) {
                let subscriber = result[i].name;
                let subscriber_email = result[i].email;
                let response = {
                    body: {
                        name: subscriber,
                        intro: subscriber_email,
                    },
                };

                let mail = MailGenerator.generate(response);


                var attachments = [];
                ImageStore.findAll({
                    where: {'tracker': tracker}
                }).then(images => {
                    for (var i = 0; i < images.length; i++) {
                        let image_path = images[i].image;
                        var hh8 = image_path.split("/");
                        var hh9 = hh8.length();
                        var image_name = hh8[hh9-1];
                        var addto_attachments = {
                            filename: image_name,
                            path: image_path
                        }
                        attachments.push({addto_attachments});
                    }

                    let message = {
                        from: EMAIL,
                        to:  subscriber_email,
                        subject: subject,
                        html: mail,
                        attachments: attachments
                    };
                    var sentMail = false;
                    transporter.sendMail(message)
                    .then(() => {});
                });
            }
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Sent news letters",
                data: []
            });
        }else{
            return res.status(403).send({
                statusCode: 403,
                status: false, 
                message: 'Could not fins subscribers',
                data: [] 
            });
        }
    })
    .catch((err)=> {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};