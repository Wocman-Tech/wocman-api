const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const {v4 : uuidv4} = require('uuid');
const Helpers = require("../helpers/helper.js");
const { verifySignUp } = require("../middleware");
const Cert = db.cert;


const Projects = db.projects;
const Project = db.projecttype;
const Share = db.share;
const WAChat = db.waChat;
const WCChat = db.wcChat;
const WWallet = db.wWallet;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { EMAIL, PASSWORD, MAIN_URL } = require("../helpers/helper.js");

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
    link: MAIN_URL,
  },
});

exports.signUpWocman = (req, res, next) => {
    if (typeof req.body.username === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "Username field is undefined.",
                data: []
            }
        );
    }else{

        if (typeof req.body.email === "undefined") {
            return res.status(400).send(
                { 
                    statusCode: 400,
                    status: false,
                    message: "Email field is undefined.",
                    data: []
                }
            );
        }else{

            if (typeof req.body.password === "undefined") {
                return res.status(400).send(
                    {
                        statusCode: 400,
                        status: false,
                        message: "Password field is undefined.",
                        data: [] 
                    }
                );
            }else{

                const verify_email_1 = uuidv4();
                var verify_email = bcrypt.hashSync(verify_email_1, 8);
                verify_email = verify_email.replace(/[^\w\s]/gi, "");

                var  SearchUsername = {};
                var Searchemail = {};
                var whereQuery = {};
                var userId = {};
                if(req.body.username && req.body.username !== ''){
                    SearchUsername = {'username': req.body.username};
                }else{
                    SearchUsername = {'username': {$not: null}};
                }
                if(req.body.email && req.body.email !== ''){
                    Searchemail = {'email': req.body.email}
                }else{
                    Searchemail = {'email': {$not: null}};
                }

                User.findOne({
                  where: Searchemail 
                })
                .then(dfg43 => {
                    if (dfg43) {
                        return res.status(404).send(
                        { 
                            statusCode: 404,
                            status: false,
                            message: "Email already exist",
                            data: []
                        });
                    }
                    User.findOne({
                      where: SearchUsername 
                    })
                    .then(uytyt7 => {
                        if (uytyt7) {
                            return res.status(404).send(
                            { 
                                statusCode: 404,
                                status: false,
                                message: "Username already exist",
                                data: []
                            });
                        }
                        User.create({
                            username: req.body.username,
                            email: req.body.email,
                            password: bcrypt.hashSync(req.body.password, 8),
                            verify_email: verify_email
                        })
                        .then(user => {

                            if(user.id && user.id !== ''){
                                userId = {'userid': user.id}
                            }else{
                                userId = {'userid': {$not: null}};
                            }
                            whereQuery = userId;

                            UserRole.findOne({
                                where: whereQuery
                            })
                            .then(userrole => {
                              if (!userrole) {
                                UserRole.create({
                                    userid: user.id,
                                    roleid: 2
                                });
                              }
                            });
                            // then send the email
                            //source:https://medium.com/javascript-in-plain-english/how-to-send-emails-with-node-js-1bb282f334fe
                            var verification_link = MAIN_URL.slice(0, -1)+Helpers.apiVersion7()+"wocman-signup-verification/"+ user.verify_email;
                            let response = {
                                body: {
                                  name: req.body.username,
                                  intro: "Welcome to Wocman Technology! We're very excited to have you on board. Click or Copy this link to any browser to procees with your registration: "+verification_link,
                                },
                            };

                            let mail = MailGenerator.generate(response);

                            let message = {
                                from: EMAIL,
                                to:  user.email,
                                subject: "signup successful",
                                html: mail,
                            };

                            transporter.sendMail(message)
                            .then(() => {
                                 res.status(200).send({
                                    statusCode: 200,
                                    status: true,
                                    message: "User registered successfully!",
                                    data: {
                                        link: verification_link, 
                                        email : user.email, 
                                        role: 'wocman'
                                    }
                                });
                            })
                            .catch(err => {
                                return res.status(500).send({
                                    statusCode: 500,
                                    status: false, 
                                    message: err.message,
                                    data: [] 
                                });
                            });
                        })
                        .catch(err => {
                            return res.status(500).send({ 
                                statusCode: 500,
                                status: false, 
                                message: err.message,
                                data: [] 
                            });
                        });
                    })
                    .catch(err => {
                        return res.status(500).send({
                            statusCode: 500,
                            status: false, 
                            message: err.message,
                            data: [] 
                        });
                    });
                })
                .catch(err => {
                    return res.status(500).send({
                        statusCode: 500,
                        status: false, 
                        message: err.message,
                        data: [] 
                    });
                });
            }
        }
    }
};

exports.signInWocman = (req, res, next) => {

    if (typeof req.body.password === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "Password field is undefined.",
                data: [] 
            }
        );
    }else{

        if (typeof req.body.email === "undefined") {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false, 
                    message: "Email field is undefined.",
                    data: []
                }
            );
        }else{

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
                }

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
                }

                var token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: 86400 // 24 hours
                });

                //making sure a user was signed in appropriately
                user.update({
                    loginlogout:0,
                    weblogintoken:token
                });

                var authorities = [];
                authorities.push("ROLE_" + "wocman".toUpperCase());
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Login successful",
                    data: {
                        accessToken: token
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
        }
    }
};

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

    const file = req.file;
    if (!file) {
        return res.status(400).send({
            statusCode: 400,
            status: false,
            message: "Profile Picture not uploaded.",
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
            image: file.filename,
            images: users.images+Helpers.padTogether()+file.filename
        })
        .then( () => {
            res.send({
                statusCode: 200,
                status: true,
                message: "Profile picture uploaded successfully",
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
};