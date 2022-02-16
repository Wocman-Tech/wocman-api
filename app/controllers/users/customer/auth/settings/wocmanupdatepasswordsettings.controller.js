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

exports.wocmanChangePassword = (req, res, next) => {
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

         var Searchemail = {};

        if(req.email && req.email !== ''){
            Searchemail = {'email': req.email}
        }else{
            Searchemail = {'email': {$not: null}};
        }


        const password = req.body.password;
        const oldpassword = req.body.oldpassword;
        const confirmpassword = req.body.confirmpassword;

        const joiCleanSchema = Joi.object({
            password: Joi.string().min(7),
            oldpassword: Joi.string(),
            confirmpassword: Joi.string().min(7)
        });

        var joyresult = joiCleanSchema.validate({ password, oldpassword, confirmpassword });
        var { value, error } = joyresult;
        if (!(typeof error === 'undefined')) {
            var msg = Helpers.getJsondata(error, 'details')[0];
            var msgs = Helpers.getJsondata(msg, 'message');
            return res.status(422).json({
                statusCode: 422,
                status: false,
                message: msgs,
                data: []
            })
        }else{
        }

        User.findOne({
            where: Searchemail
        })
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

            var passwordIsValid = bcrypt.compareSync(
                oldpassword,
                users.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    statusCode: 401,
                    status: false,
                    accessToken: null,
                    message: "oldpassword incorrect",
                    data: []
                });
            }
            
            if (password !== confirmpassword) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Password Mis-match",
                    data: []
                });
            }

            users.update({
              password: bcrypt.hashSync(password, 8)
            })
            .then( (kk) => {

                const pushUser = users.id;
                const pushType = 'service';
                const pushBody = 'Dear ' + users.username + ", <br />You have Changed your password today. " +
                                " <br /> This would take effect from next login.";

                Helpers.pushNotice(pushUser, pushBody, pushType);

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Password was Changed",
                    data: {
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