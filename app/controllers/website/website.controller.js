const db = require("../../models");
const config = require("../../config/auth.config");
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

const {v4 : uuidv4} = require('uuid');
const Helpers = require("../../helpers/helper.js");
const { verifySignUp } = require("../../middleware");
const Joi = require('joi'); 

let nodeGeocoder = require('node-geocoder');
 
let options = {
  provider: 'openstreetmap'
};


const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { EMAIL, PASSWORD, MAIN_URL } = require("../../helpers/helper.js");

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



const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


//website routes
exports.locationData = (req, res, next) => {
    var locationName =  req.params.location;
    if (typeof locationName === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "location is undefined.",
                data: []
            }
        );
    }else{

        let geoCoder = nodeGeocoder(options);geoCoder.geocode(locationName)
        .then((locationResult)=> {
            User.findAndCountAll({
                where: {address: locationName}
            })
            .then(result => {
                var isWocman = 0;
                var isWocmanActive = 0;
                if (result) {
                    for (var i = 0; i < result.length; i++) {
                        UserRole.findOne({
                            where: {userid: result[i].id}
                        }).then(wocmanrole => {
                            if (wocmanrole && (wocmanrole.roleid == 2) ) {
                                isWocman = isWocman + 1;
                            }
                        }).catch((err) => {
                            //should not be checked
                        });
                        Projects.findAndCountAll({
                            where: {wocmanid: result[i].id}
                        }).then(doneProject => {
                            if (doneProject) {
                                var singleComplete = 0;
                                for (var i = 0; i < doneProject.length; i++) {
                                    if (doneProject[i].projectcomplete == 1) {
                                        singleComplete = 1;
                                    }
                                }
                                isWocmanActive = isWocmanActive +  singleComplete;
                            }
                        }).catch((err) => {
                            //should not be checked
                        });
                    }
                }

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Location mapped",
                    data: {
                        location: locationName,
                        data: locationResult,
                        wocman: isWocman,
                        active: isWocmanActive
                    }
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
        })
        .catch((err)=> {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    }
};

exports.newsletter = (req, res, next) => {
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

exports.subscribenewsletter = (req, res, next) => {

    var emailAddress =  req.body.email;
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

        Nletter.findAndCountAll({
            where: {email: emailAddress}
        })
        .then(result => {
            // console.log(result);
            if (result.count == 0) {
               Nletter.create({
                    email: emailAddress
                })
                .then(hgh  => {
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: 'Successful newsletter subscription',
                        data: []
                    });
                })
                .catch(err => {
                    res.status(500).send({ message: err.message });
                });
            }else{
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Email Already subscribed",
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
    }
};

exports.contactus = (req, res, next) => {

    var emailAddress =  req.body.email;
    var name =  req.body.name;
    var phone =  req.body.phone;
    var inquiry =  req.body.inquiry;
    var message =  req.body.message;

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
                        Contactus.create({
                            name: emailAddress,
                            email: name,
                            phone: phone,
                            enquiry: inquiry,
                            message: message
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

exports.checkVerifyEmailLinkWocman = (req, res) => {
    var email_link =  req.params.link;

    var whereQuery = {};

    var SearchemailLink = {};
    // console.log(email_link);
    if (typeof email_link === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Email link is undefined.",
                data: []
            }
          );
    }else{

        if(email_link && email_link !== ''){
            SearchemailLink = {'verify_email': email_link};
        }else{
            SearchemailLink = {'verify_email': {$not: null}};
        }
        whereQuery = SearchemailLink;

        User.findOne({
            where: whereQuery 
        })
        .then(users => {
            if (!users) {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "Email link does not exist.",
                     data: []
                });
          
            }
      
            var token = jwt.sign({ id: users.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            var authorities = [];

            authorities.push("ROLE_" + "wocman".toUpperCase());
            
            res.status(200).send({
                statusCode: 200,
                status: false,
                message: "Link available",
                data: {
                    accessToken: token
                }
                
            });
        })
        .catch(err => {
            return  res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        }); 
    }
};

exports.wocmanResetPassword = (req, res, next) => {
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
        const verify_email_1 = uuidv4();
        var verify_email = bcrypt.hashSync(verify_email_1, 8);
        verify_email = verify_email.replace(/[^\w\s]/gi, "");

        var  SearchUsername = {};
        var Searchemail = {};
        var whereQuery = {};
        var userId = {};
       
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
                
                dfg43.update({
                    changepassword: verify_email
                })
                .then(tht => {
                    //source:https://medium.com/javascript-in-plain-english/how-to-send-emails-with-node-js-1bb282f334fe
                    var verification_link = MAIN_URL.slice(0, -1)+Helpers.apiVersion7()+"wocman-password-reset/" + dfg43.changepassword;
                    let response = {
                        body: {
                          name: dfg43.username,
                          intro: "You have requested that your passwordbe changed. If not you, kindly contact us from the contact us page. Click or Copy this link to any browser to procees with your request to change your password: "+verification_link,
                        },
                    };

                    let mail = MailGenerator.generate(response);

                    let message = {
                        from: EMAIL,
                        to:  dfg43.email,
                        subject: "Password Reset Request",
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
                    message: "Email does not  exist",
                    data: []
                });
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
    }
};

exports.wocmanResetPasswordConfirm = (req, res, next) => {
    var email_link =  req.params.link;
    var SearchemailLink = {};
    // console.log(email_link);
    if (typeof email_link === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Email link is undefined.",
                data: []
            }
          );
    }else{

        if(email_link && email_link !== ''){
            SearchemailLink = {'changepassword': email_link};
        }else{
            SearchemailLink = {'changepassword': {$not: null}};
        }

        User.findOne({
            where: SearchemailLink 
        })
        .then(users => {
            if (!users) {
                return res.status(404).send(
                { 
                    statusCode: 404,
                    status: false,
                    message: "Email link does not exist.",
                    data: []
                });
          
            }
            if (parseInt(users.changepassword, 10) == 1) {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "password reset has been completed already",
                    data: []
                });
            }
            if (typeof users.changepassword === 'undefined') {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "password reset link has not been created",
                    data: []
                });
            }

            var authorities = [];

            authorities.push("ROLE_" + "wocman".toUpperCase());
            
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Reset password confirmation",
                data: {
                    username: users.username,
                    email: users.email,
                    changepassword: users.changepassword,
                    roles: authorities
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
};

exports.wocmanStartResetPassword = (req, res, next) => {
    var email_link =  req.body.link;
    var password_link =  req.body.password;
    if (typeof password_link === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "password field is undefined.",
                data: [] 
            }
        );
    }
    if (password_link.length < 7 ) {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Invalid password. Minimum of 9 characters link is undefined." ,
                data: []
            }
        );
    }else{
        var password = bcrypt.hashSync(password_link, 8);
    }
    var SearchemailLink = {};
    if (typeof email_link === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "link is undefined." ,
                data: []
            }
        );
    }else{

        if(email_link && email_link !== ''){
            SearchemailLink = {'changepassword': email_link};
        }else{
            SearchemailLink = {'changepassword': {$not: null}};
        }

        User.findOne({
            where: SearchemailLink 
        })
        .then(users => {
            if (!users) {
                return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "link does not exist.",
                    data: []
                });
            }
            users.update({
                password: password,
                changepassword: 1
            })
            .then(khj => {
                var authorities = [];

                authorities.push("ROLE_" + "wocman".toUpperCase());

                var verification_link = MAIN_URL.slice(0, -1)+Helpers.apiVersion7()+"auth/wocman-signin";
                let response = {
                    body: {
                      name: users.username,
                      intro: "Welcome to Wocman Technology! We're very excited to have you on board. Thank you for completing your signup. Click or Copy this link to any browser to login: "+verification_link,
                    },
                };

                let mail = MailGenerator.generate(response);

                let message = {
                    from: EMAIL,
                    to:  users.email,
                    subject: "Sign-up successful",
                    html: mail,
                };

                transporter.sendMail(message)
                .then(() => {
                })
                .catch(err => {
                });
                
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Password Reset successfully",
                    data: {
                        username: users.username,
                        email: users.email,
                        password: users.password,
                        changepassword: users.changepassword,
                        roles: authorities
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