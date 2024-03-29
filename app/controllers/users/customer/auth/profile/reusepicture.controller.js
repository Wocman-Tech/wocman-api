const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;

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
const urlExistSync = require("url-exist-sync");


const Op = db.Sequelize.Op;

exports.ReuseProfilePicture = (req, res, next) => {
    // Username
    var image =  req.body.image_link;
    
    if (typeof image === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Image link is undefined.",
                data: []
            }
          );
    }else{
        
        var theimaeg = image;

        var linkExist =  urlExistSync(theimaeg);
        if (linkExist === true) {
            
            
            User.findByPk(req.userId).then(user => {
                if (!user) {
                  res.status(400).send({
                    statusCode: 400,
                    status: false,
                    message: "User Not Found",
                    data: []
                  });
                  return;
                }
                user.update({
                    image: image
                })
                .then(() => {
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Profile picture is re-used",
                        data: {
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
        }else{
            return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "Image does not exist.",
                    data: []
                }
            );
        
        }
    }
};