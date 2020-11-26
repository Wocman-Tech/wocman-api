const pathRoot = '../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
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
var async = require("async");

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
    link: MAIN_URL,
  },
});


const Op = db.Sequelize.Op;

exports.locationData = (req, res, next) => {
//Get today's date using the JavaScript Date object.
const newDate = new Date().toLocaleString('en-US', {
  timeZone: 'Africa/Lagos'
});
const ourDate = new Date().toLocaleString('en-US', {
  timeZone: 'Africa/Lagos'
});
var firstDay = new Date(newDate.split(',')[0]);
var pastDate= new Date(firstDay.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleString('en-US', {
  timeZone: 'Africa/Lagos'
});

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

        const schemaJoiSearchLocation = Joi.object({
            location: Joi.string()
                .alphanum()
                .min(3)
                .max(100)
                .required()
        });

        var joyresult = schemaJoiSearchLocation.validate({ location: req.params.location });
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
        }

        let geoCoder = nodeGeocoder(options);geoCoder.geocode(locationName)
        .then((locationResult)=> {

            User.findAll({
                attributes: ['id'],
                where: {address: locationName}
            })
            .then(result => {
                const dic = [];
                if (result) {
                    for (var i = 0; i < result.length; i++) {
                        var Rowid = Helpers.getJsondata(result[i].dataValues, 'id');
                        dic.push(Rowid);
                    }
                    
                    var dic2 = [];

                    UserRole.findAll({
                        attributes: ['userid'],
                        where: {roleid: 2 }
                    }).then(wocmanrole => {

                        if (wocmanrole) {
                            for (var i = 0; i < wocmanrole.length; i++) {
                                var Rowid = Helpers.getJsondata(wocmanrole[i].dataValues, 'userid');
                                dic2.push(Rowid);
                            }
                        }

                        var dic1 = [];
                        Projects.findAll({
                            attributes: ['wocmanid'],
                            where: {projectcomplete : 1}
                        }).then(doneProject => {
                            if (doneProject) {
                                for (var i = 0; i < doneProject.length; i++) {
                                    var Rowid = Helpers.getJsondata(doneProject[i].dataValues, 'wocmanid');
                                    dic1.push(Rowid);
                                }
                            }

                            dicresult = [];

                            dicresult = dic.filter(function(item){
                              if ( dic2.indexOf(item) !== -1 ) return item;
                            });

                            console.log(dicresult);

                            var todate = [];
                            var alldate = [];
                            UserRole.findAll({
                                attributes: ['userid'],
                                where: {
                                    createdAt: {
                                        [Op.between]: [pastDate, newDate]
                                    },
                                    roleid: 2
                                }
                            })
                            .then(resultbydate => {
                                if (resultbydate) {
                                    for(var i = 0; i < resultbydate.length; i++) {
                                        var Rowid = Helpers.getJsondata(resultbydate[i].dataValues, 'userid');
                                        todate.push(Rowid);
                                    }
                                }

                              
                                UserRole.findAll({
                                    attributes: ['userid'],
                                    where: {roleid: 2}
                                })
                                .then(userroleresult => {
                                    if (userroleresult) {
                                        for(var i = 0; i < userroleresult.length; i++) {
                                            var Rowid = Helpers.getJsondata(userroleresult[i].dataValues, 'userid');
                                            alldate.push(Rowid);
                                        }
                                    }

                                    const weekratio = (todate.length/alldate.length) * 100; //1;
                                    res.status(200).send({
                                        statusCode: 200,
                                        status: true,
                                        message: "Location mapped",
                                        data: {
                                            location: locationName,
                                            data: locationResult,
                                            wocman: dicresult.length,
                                            active: dic1.length,
                                            weekly_percentage_increase: weekratio
                                        }
                                    })
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