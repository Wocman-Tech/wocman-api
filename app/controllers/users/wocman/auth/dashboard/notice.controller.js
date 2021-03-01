const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.user;
const Role = db.role;
const UserRole = db.userRole;

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


exports.notice = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.userId, 10) === 1) {
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
            if(req.userId && req.userId !== ''){
                Searchuserid = {'userid': req.userId};
                Searchwocmanid = {'wocmanid': req.userId};
            }else{
                Searchuserid = {'userid': {$not: null}};
                Searchwocmanid = {'wocmanid': {$not: null}};
            }
            

            var notice = [];
            
            WNotice.findAll({
                where: Searchuserid
            })
            .then(wnotice => {
                if (!wnotice) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Notice Not Found",
                        data: {
                            AccessToken: req.token,
                            Unboard: users.unboard
                        }
                    });
                }else{

                    for (let i = 0; i < wnotice.length; i++) {
                        if (parseInt(wnotice[i].seen, 10) == 0) {
                            notice.push(
                                {
                                    notice: wnotice[i].notice, 
                                    type: wnotice[i].type,
                                    link: wnotice[i].link,
                                    date: wnotice[i].date
                                }
                            );
                        }
                    }
                }
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found a wocmna user",
                    data: {
                        Notice: notice,
                        AccessToken: req.token,
                        Unboard: users.unboard
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