const pathRoot = '../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const passport = require('passport');
const cookieSession = require('cookie-session');
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
const IpBlacklist = db.Ipblacklist;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const { resolve, port, website }  = require(pathRoot + "config/auth.config");

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
    host: config.message_server,
    port: 465,
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



const schemaJoiIP = Joi.object({
    ipaddress: Joi.string().min(10).required()
});

const Op = db.Sequelize.Op;

exports.proceedSignIn = (req, res, next) => {
    if (typeof req.email === "undefined" || req.email == null) {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "Could not resolve google oauth",
        data: [],
      });
    } else {
      var email = req.email;
      var name = req.name;
      var password = req.password;
  
      User.findOne({
        where: { email: email },
      })
        .then((user) => {
          if (!user) {
            User.create({
              username: name,
              email: email,
              password: bcrypt.hashSync(req.body.tokenId, 8),
              verify_email: 1,
              signuptype: req.body.tokenId,
            })
              .then((nuser) => {
                var sentMail = false;
  
                // Create Settings
                Wsetting.create({
                  userid: nuser.id,
                })
                  .then((gf6) => {
                    Wsetting.findOne({
                      where: { userid: nuser.id },
                    })
                      .then((hasSettings) => {
                        if (
                          parseInt(hasSettings.securityipa, 10) == 0 &&
                          parseInt(hasSettings.security2fa, 10) == 0
                        ) {
                          // Return user data here
                          var token = jwt.sign({ id: nuser.id }, config.secret, {
                            expiresIn: 86400, // 24 hours
                          });
  
                          // Make sure the user was signed in appropriately
                          nuser.update({
                            loginlogout: 0,
                            weblogintoken: token,
                          });
  
                          var unboard = Helpers.returnBoolean(nuser.unboard);
                          var isEmailVerified = Helpers.returnBoolean(
                            nuser.verify_email
                          );
                          var isProfileUpdated = Helpers.returnBoolean(
                            nuser.profileupdate
                          );
                         
  
                          if (
                            isEmailVerified !== true &&
                            isEmailVerified !== false
                          ) {
                            isEmailVerified = false;
                          }
                          res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Login successful",
                            isdevice: false,
                            isOtp: false,
                            data: {
                              email: nuser.email,
                              verify_email: nuser.verify_email,
                              username: nuser.username,
                              firstname: nuser.firstname,
                              lastname: nuser.lastname,
                              address: nuser.address,
                              country: nuser.country,
                              state: nuser.state,
                              province: nuser.province,
                              phone: nuser.phone,
                              image: nuser.image,
                              role: 'customer',
                              accessToken: token,
                              isEmailVerified: isEmailVerified,
                              isProfileUpdated: isProfileUpdated,
                              unboard: unboard
                            }
                          });
                        }else{
  
                          const otp = Math.floor(100000 + Math.random() * 900000);
  
                          let response = {
                              body: {
                                  name: nuser.username,
                                  intro: "Welcome to Wocman Technology! You requested an OTP to login.",
                                  action: {
                                      instructions: `Copy this OTP to continue Login: ${otp}`,
                                      button: {}
                                  },
                              }
                          };
  
                          let mail = MailGenerator.generate(response);
  
                          let message = {
                              from: EMAIL,
                              to:  nuser.email,
                              subject: "Securiy Concern: Login Verification",
                              html: mail,
                          };
  
                          transporter.sendMail(message)
                          .then(  sentMails => {
                              var sentMail = true;
                          })
                          User.update(
                              {
                                  weblogin2fa: otp
                              },
                              {
                                  where: {id: nuser.id}
                              }
                          );
                          return res.status(200).send({
                              statusCode: 200,
                              status: true,
                              isotp: true,
                              message: 'An OTP Was Sent',
                              data: {
                                  opt: otp,
                                  email: email,
                                  password: password,
                                  sentMail: sentMail
                              }
                          });
                        }
                      })
                      .catch((err) => {
                        return res.status(500).send({
                          statusCode: 500,
                          status: false,
                          message: err.message,
                          data: [],
                        });
                      });
                  })
                  .catch((err) => {
                    return res.status(500).send({
                      statusCode: 500,
                      status: false,
                      message: err.message,
                      data: [],
                    });
                  });
              })
              .catch((err) => {
                return res.status(500).send({
                  statusCode: 500,
                  status: false,
                  message: err.message,
                  data: [],
                });
              });
          } else {
            if (user.signuptype == "customer") {
              return res.status(400).send({
                statusCode: 400,
                status: false,
                message: "User Registered Already",
                data: [],
              });
            } else {
              User.update(
                {
                  password: bcrypt.hashSync(req.body.tokenId, 8),
                  signuptype: req.body.tokenId,
                },
                {
                  where: { email: email },
                }
              );
  
              Wsetting.findOne({
                where: { userid: user.id },
              })
                .then((hasSettings) => {
                  if (
                    parseInt(hasSettings.securityipa, 10) == 0 &&
                    parseInt(hasSettings.security2fa, 10) == 0
                  ) {
                    // Return user data here
                    var token = jwt.sign({ id: user.id }, config.secret, {
                      expiresIn: 86400, // 24 hours
                    });
  
                    // Make sure the user was signed in appropriately
                    user.update({
                      loginlogout: 0,
                      weblogintoken: token,
                    });
  
                    var unboard = Helpers.returnBoolean(user.unboard);
                    var isEmailVerified = Helpers.returnBoolean(
                      user.verify_email
                    );
                    var isProfileUpdated = Helpers.returnBoolean(
                      user.profileupdate
                    );
                   
  
                    if (
                      isEmailVerified !== true &&
                      isEmailVerified !== false
                    ) {
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
                        verify_email: user.verify_email,
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        address: user.address,
                        country: user.country,
                        state: user.state,
                        province: user.province,
                        phone: user.phone,
                        image: user.image,
                        role: 'customer',
                        accessToken: token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
                        unboard: unboard
                      }
                    });
                  }else{
  
                    const otp = Math.floor(100000 + Math.random() * 900000);
  
                    let response = {
                        body: {
                            name: user.username,
                            intro: "Welcome to Wocman Technology! You requested an OTP to login.",
                            action: {
                                instructions: `Copy this OTP to continue Login: ${otp}`,
                                button: {}
                            },
                        }
                    };
  
                    let mail = MailGenerator.generate(response);
  
                    let message = {
                        from: EMAIL,
                        to:  user.email,
                        subject: "Securiy Concern: Login Verification",
                        html: mail,
                    };
  
                    transporter.sendMail(message)
                    .then(  sentMails => {
                        var sentMail = true;
                    })
                    User.update(
                        {
                            weblogin2fa: otp
                        },
                        {
                            where: {id: user.id}
                        }
                    );
                    return res.status(200).send({
                        statusCode: 200,
                        status: true,
                        isotp: true,
                        message: 'An OTP Was Sent',
                        data: {
                            opt: otp,
                            email: email,
                            password: password,
                            sentMail: sentMail
                        }
                    });
                  }
                })
                .catch((err) => {
                  return res.status(500).send({
                    statusCode: 500,
                    status: false,
                    message: err.message,
                    data: [],
                  });
                });
            }
          }
        })
        .catch((err) => {
          return res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    }
  };
  