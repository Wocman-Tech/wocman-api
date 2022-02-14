const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const WWallet = db.WWallet;

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

exports.walletDetails = (req, res, next) => {
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
            }else{
                Searchuserid = {'userid': {$not: null}};
            }


            WWallet.findAll({
                where: Searchuserid
            })
            .then(wwallet => {
                if (!wwallet) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Wallet Not Found",
                        data: {
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }
                    
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found a wocman user",
                    data: {
                        wallet: wwallet,
                        name: users.firstname+ " "+users.lastname,
                        accessToken: req.token,
                        nnboard: unboard
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