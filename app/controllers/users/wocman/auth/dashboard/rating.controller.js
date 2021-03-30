const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const Wrate = db.wrate;

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

exports.rating = (req, res, next) => {
    // console.log(req.email_link);
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
            var unboard = Helpers.returnBoolean(users.unboard);

            if(req.userId && req.userId !== ''){
                Searchuserid = {'userid': req.userId};
                Searchwocmanid = {'wocmanid': req.userId};
            }else{
                Searchuserid = {'userid': {$not: null}};
                Searchwocmanid = {'wocmanid': {$not: null}};
            }
            var rateUser = 0;
            var rateUserCount = 0;
            Wrate.findAll({
                where: Searchuserid
            })
            .then(wrate => {
                if (!wrate) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Rate Not Found",
                        data: {
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }else{

                    for (let i = 0; i < wrate.length; i++) {
                        rateUserCount = rateUserCount + 1;
                        rateUser = rateUser + parseInt(wrate[i].rateUser, 10);
                    }
                }
                if (rateUser > 0 && rateUserCount > 0) {
                    rateUserWocman = rateUser/rateUserCount;
                }else{
                    rateUserWocman = 0;
                }
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found a wocmna user",
                    data: {
                        rate: rateUserWocman,
                        accessToken: req.token,
                        unboard: unboard
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