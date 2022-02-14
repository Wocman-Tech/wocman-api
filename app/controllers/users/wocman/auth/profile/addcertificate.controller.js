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
const User = db.User;
const Cert = db.Cert;

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

exports.wocmanAddCertificate = (req, res, next) => {
    var cert_name =  req.body.name;
    var cert_issue_date =  req.body.issued_date;

    if (typeof cert_name === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Certificate name field is undefined.",
                data: [] 
            }
        );
    }
    if (typeof cert_issue_date === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Certificate date of issue field is undefined.",
                data: []
            }
        );
    }
    // console.log(req.file);
    const file = req.file;//this is the file name
    
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

    // console.log(file);
    let myFile =  file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]
    const dsf = uuidv4();

    const params = {
        ACL: "public-read-write",
        Bucket: config.awsS3BucketName,
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
        //schema
        const joiCleanSchema = Joi.object().keys({ 
            cert_name: Joi.string().min(1).max(225).required(), 
            cert_issue_date: Joi.string().min(1).max(225).required(), 
        }); 
        const dataToValidate = {
          cert_name: cert_name,
          cert_issue_date: cert_issue_date
        }
        const joyResult = joiCleanSchema.validate(dataToValidate);
        if (joyResult.error == null) {
        }else{
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: joyResult.error,
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

            Cert.findOne({
                where: {'name' : cert_name, 'userid' : user_id }
            }).then(ds34dsd => {
                if (!ds34dsd) {
                }else{
                    return res.status(404).send({
                        statusCode: 400,
                        status: false,
                        message: "Certificate Already exist for such user",
                        data: []
                    });
                }

                Cert.create({
                    userid: user_id,
                    name: cert_name,
                    issue_date: cert_issue_date,
                    picture: fileUrl
                })
                .then(hgh  => {

                    const pushUser = user_id;
                    const pushType = 'service';
                    const pushBody = 'Dear ' + users.username + ", <br />You have added " +
                                    "a certificate. <br /> This would be reviewed soon " +
                                    "<br />A corresponding response would be sent to you<br/>";

                    Helpers.pushNotice(pushUser, pushBody, pushType);

                    User.update(
                        {certificatesupdate: 1},
                        {where: {id: user_id} }
                    );
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Certificate was added",
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