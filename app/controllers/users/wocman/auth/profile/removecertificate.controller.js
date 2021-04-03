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

exports.wocmanRemoveCertificate = (req, res, next) => {
    var cert_id =  req.body.certificate_id;

    if (typeof cert_id === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Certificate  field is undefined." ,
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

    //schema
    const joiCleanSchema = Joi.object().keys({ 
        cert_id: Joi.number().integer().min(1).max(225).required(),
    }); 
    const dataToValidate = {
      cert_id: cert_id
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
                statusCode: 404,
                status: false,
                message: "User Not found.",
                data: []
            });
        }
        Cert.findByPk(cert_id).then(ds34dsd => {
            if (!ds34dsd) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Certificate Not Found",
                    data: []
            });
            }else{
                if (ds34dsd.userid == user_id) {
                    //delete certificate
                    Cert.destroy({
                        where: {'id': cert_id}
                    })
                    .then(deleteCert => {
                        Cert.findAll(
                            {where: {'userid': user_id}}
                        ).then(ds34dsd => {
                            if (!ds34dsd) {
                                User.update(
                                    {certificatesupdate: 0},
                                    {where: {id: users.id} }
                                );
                            }

                            const pushUser = users.id;
                            const pushType = 'service';
                            const pushBody = 'Dear ' + users.username + ", <br />You have removed a certificate. " +
                                            "<br /> This would cause a review of your data " +
                                            "<br/> We would notify you when we are done";

                            Helpers.pushNotice(pushUser, pushBody, pushType);
                        
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Certificate was removed",
                                data: {
                                    accessToken:req.token
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
                    .catch(err => {  res.status(500).send({message: err.message }); });
                }else{
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Certificate ownership Not resolved",
                        data: []
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