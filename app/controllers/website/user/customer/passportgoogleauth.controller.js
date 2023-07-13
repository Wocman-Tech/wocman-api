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
            .then((newUser) => {
              // Create Settings for the new user
              Wsetting.create({
                userid: newUser.id,
              })
                .then((settings) => {
                  // Generate token
                  var token = jwt.sign({ id: newUser.id }, config.secret, {
                    expiresIn: 86400, // 24 hours
                  });

                  // Update user login/logout details
                  newUser.update({
                    loginlogout: 0,
                    weblogintoken: token,
                  });

                  // Prepare response data
                  var unboard = Helpers.returnBoolean(newUser.unboard);
                  var isEmailVerified = Helpers.returnBoolean(
                    newUser.verify_email
                  );
                  var isProfileUpdated = Helpers.returnBoolean(
                    newUser.profileupdate
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
                      email: newUser.email,
                      verify_email: newUser.verify_email,
                      username: newUser.username,
                      firstname: newUser.firstname,
                      lastname: newUser.lastname,
                      address: newUser.address,
                      country: newUser.country,
                      state: newUser.state,
                      province: newUser.province,
                      phone: newUser.phone,
                      image: newUser.image,
                      role: "customer",
                      accessToken: token,
                      isEmailVerified: isEmailVerified,
                      isProfileUpdated: isProfileUpdated,
                      unboard: unboard,
                    },
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
          // Handle existing user case as before
          // ...
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

  