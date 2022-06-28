const baseUrl = "../../";
const jwt = require("jsonwebtoken");
const config = require(baseUrl+"config/auth.config.js");
const { User, UserRole, RootAdmin, Wsetting } = require('../../models');

var bcrypt = require("bcryptjs");

const otp = Math.floor(100000 + Math.random() * 900000);

const isInitiateAdmin = (req, res, next) => {

    RootAdmin.findOne({
        where: {'isroot': 1}
    })
    .then(adminroot => {
        if (!adminroot) {
            res.status(403).send({
                statusCode: 403,
                status: false,
                message: "Contact Developer",
                data: []
            });
            return;
        }

        var searchemail = {'email': adminroot.email}
        req.email = req.body.email;

        User.findOne({
            where:  searchemail
        })
        .then(user_exist => {
            if (!user_exist && adminroot.email == req.body.email) {

                //create it
                User.create({
                    username: 'Admin',
                    email: req.body.email,
                    password: bcrypt.hashSync(config.companyPassword, 8),
                    verify_email: otp,
                    signuptype: 'admin'
                })
                .then(user => {
                    UserRole.findOne({
                        where: {userid: user.id}
                    })
                    .then(userrole => {
                        if (!userrole) {
                            UserRole.create({
                                userid: user.id,
                                roleid: 1
                            });
                        }
                    });
                    Wsetting.findOne({
                        where: {userid: user.id}
                    })
                    .then(hasSettings => {
                        if (!hasSettings) {
                            Wsetting.create({
                                userid: user.id,
                                emailnotice: 1,
                                servicenotice: 1
                            });
                        }
                    });
                    
                    var verification_link = otp;
                    let response = {
                        body: {
                            name: "Admin",
                            intro: "Welcome to Wocman Technology! We're very excited to have you on board as a root admin.",
                            action: {
                                instructions: `Copy this OTP to process your registration: ${verification_link}`,
                                button: {
                                    color: '#22BC66', // Optional action button color
                                    text: 'Click Here to Verify',
                                    link: verifyLink
                                }
                            },
                        }
                    };

                    let mail = MailGenerator.generate(response);

                    let message = {
                        from: EMAIL,
                        to:  user.email,
                        subject: "Signup Successful",
                        html: mail,
                    };
                    transporter.sendMail(message)
                    .then(() => {
                    })
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
            next();
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

const initiateAdmin = {
    isInitiateAdmin: isInitiateAdmin
};
module.exports = initiateAdmin;