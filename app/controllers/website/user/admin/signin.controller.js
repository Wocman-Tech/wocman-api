const pathRoot = '../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Nletter = db.Nletter;
const Contactus = db.Contactus;

const Projects = db.Projects;
const Project = db.Projecttype;
const Wshear = db.Wshear;
const WAChat = db.WaChat;
const WCChat = db.WcChat;
const WWallet = db.WWallet;
const Wsetting = db.Wsetting;


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
 
const Op = db.Sequelize.Op;

exports.signInAdmin = (req, res, next) => {
    var searchemail = {};
    var searchPassword = {};
    if(req.body.password && req.body.password !== ''){
        searchPassword = {'password': req.body.password};
    }else{
        searchPassword = {'password': {$not: null}};
    }
    if(req.body.email && req.body.email !== ''){
        searchemail = {'email': req.body.email}
    }else{
        searchemail = {'email': {$not: null}};
    }

    User.findOne({
        where: searchemail
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                date: []
            });
        }else{
            // console.log(user.signuptype);
            if (user.signuptype !== 'admin') {
                return res.status(401).send({
                    statusCode: 401,
                    status: false,
                    accessToken: null,
                    message: "Use the google sign up",
                    data: []
                });
            }else{

                var passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );
                if (!passwordIsValid) {
                    return res.status(401).send({
                        statusCode: 401,
                        status: false,
                        accessToken: null,
                        message: "Invalid Password!",
                        data: []
                    });
                }else{

                    var token = jwt.sign({ id: user.id }, config.secret, {
                        expiresIn: 86400 // 24 hours
                    });

                    var unboard = Helpers.returnBoolean(user.unboard);
                    var isEmailVerified = Helpers.returnBoolean(user.verify_email);
                    var isProfileUpdated = Helpers.returnBoolean(user.profileupdate);
                    

                    //making sure a user was signed in appropriately
                    user.update({
                        loginlogout:0,
                        weblogintoken:token
                    });
                    if (isEmailVerified !== true && isEmailVerified !== false) {
                        isEmailVerified = false;
                    }
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Login successful",
                        isdevice: false,
                        isOtp: false,
                        data: {
                            email: user.email,
                            username: user.username,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            address: user.address,
                            country: user.country,
                            state: user.state,
                            province: user.province,
                            phone: user.phone,
                            image: user.image,
                            role: 'admin',
                            accessToken: token,
                            isEmailVerified: isEmailVerified,
                            isProfileUpdated: isProfileUpdated,
                            unboard: unboard
                        }
                    });
                }
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
};