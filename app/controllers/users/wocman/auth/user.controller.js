const db = require("../../../../models");
const config = require("../../../../config/auth.config");
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
const Helpers = require("../../../../helpers/helper.js");
const { verifySignUp } = require("../../../../middleware");
const Joi = require('joi'); 

let nodeGeocoder = require('node-geocoder');
 
let options = {
  provider: 'openstreetmap'
};


const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { EMAIL, PASSWORD, MAIN_URL } = require("../../../../helpers/helper.js");

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

// wocman routes

exports.checkCompleteProfileWocman = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.email_link, 10) === 1) {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "Account has been completed before now",
            data: {
                token: null 
            }
        });
    }else{

        var Searchemail = {};

        if(req.email && req.email !== ''){
            Searchemail = {'email': req.email}
        }else{
            Searchemail = {'email': {$not: null}};
        }

        if(req.body.firstname && req.body.firstname !== ''){
            var firstname = req.body.firstname;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your Firstname",
                data: []
            });
        }

        if(req.body.lastname && req.body.lastname !== ''){
            var lastname = req.body.lastname;
        }else{
            return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "Enter Your Lastname",
                data: []
            });
        }

        if(req.body.address && req.body.address !== ''){
            var address = req.body.address;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your Home/Work Address" ,
                data: []
            });
        }


        if(req.body.phone && req.body.phone !== ''){
            var phone = req.body.phone;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your contact address" ,
                data: []
            });
        }

        if(req.body.country && req.body.country !== ''){
            var country = req.body.country;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your country name",
                data: []
            });
        }
        if(req.body.state && req.body.state !== ''){
            var state = req.body.state;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your State name" ,
                data: []
            });
        }
        if(req.body.province && req.body.province !== ''){
            var province = req.body.province;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your address province" ,
                data: []
            });
        }


        User.findOne({
            where: Searchemail
        })
        .then(users => {
            if (!users) {
                res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not found.",
                    data: []
                });
            }

           users.update({
              firstname: firstname,
              lastname: lastname,
              address: address,
              phone: phone,
              country: country,
              state: state,
              province: province,
              verify_email:1
            })
            .then( () => {
                res.send({
                    statusCode: 200,
                    status: true,
                    message: "Profile complete successful",
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
    }
};

exports.wocmanProfile = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.userId, 10) === 1) {
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
            if(req.userId && req.userId !== ''){
                Searchuserid = {'userid': req.userId};
                Searchwocmanid = {'wocmanid': req.userId};
            }else{
                Searchuserid = {'userid': {$not: null}};
                Searchwocmanid = {'wocmanid': {$not: null}};
            }

            var profilePictures = [];
            var otherImages = [];
            var currentImage = [];
            var pp = (users.images).split(Helpers.padTogether());
            for (let i = 0; i <  pp.length; i++) {
                if (pp[i] !== users.image) {
                    var theimaeg = Helpers.pathToImages() +  'wocman/picture/'+ pp[i];
                    if (fs.existsSync(theimaeg)) {
                        theimaeg = Helpers.coreProjectPath() + theimaeg;
                    }else{
                        theimaeg = '';
                    }

                    otherImages.push(
                        [
                            theimaeg
                        ]
                    );
                }
            }
            var theimaeg = Helpers.pathToImages() +  'wocman/picture/'+ users.image;
            if (fs.existsSync(theimaeg)) {
                theimaeg = Helpers.coreProjectPath() + theimaeg;
            }else{
                theimaeg = '';
            }
            currentImage.push(
                [
                    theimaeg
                ]
            );

            profilePictures.push(
                {
                    current: currentImage, 
                    others: otherImages
                }
            );

            var certificates = [];

            var c_unverified = [];
            var c_accepted = [];
            var c_unaccepted = [];
            
            Cert.findAll({
                where: Searchuserid
            })
            .then(certs9o => {
                if (!certs9o) {
                }else{
                    for (let i = 0; i < certs9o.length; i++) {
                        var theimaeg = Helpers.pathToImages() +  'wocman/certificate/'+ certs9o[i].picture;
                        if (fs.existsSync(theimaeg)) {
                            theimaeg = Helpers.coreProjectPath() + theimaeg;
                        }else{
                            theimaeg = '';
                        }
                        if (parseInt(certs9o[i].status, 10) == 0) {

                            c_unverified.push(
                                [
                                    certs9o[i].id, 
                                    certs9o[i].name,
                                    theimaeg, 
                                    certs9o[i].issue_date
                                ]
                            );
                        }
                        if (parseInt(certs9o[i].status, 10) == 1) {
                            
                            c_unaccepted.push(
                                [
                                    certs9o[i].id, 
                                    certs9o[i].name,
                                    theimaeg,
                                    certs9o[i].issue_date
                                ]
                            );
                        }
                        if (parseInt(certs9o[i].status, 10) == 2) {
                            
                            c_accepted.push(
                                [
                                    certs9o[i].id, 
                                    certs9o[i].name,
                                    theimaeg,
                                    certs9o[i].issue_date
                                ]
                            );
                        }
                    }
                    certificates.push(
                        {
                            unverified: c_unverified, 
                            unaccepted: c_unaccepted, 
                            accepted: c_accepted
                        }
                    );
                }
                var wallet = [];

                WWallet.findAll({
                    where: Searchuserid
                })
                .then(wwallet => {
                    if (!wwallet) {}else{
                        wallet.push(
                            {
                                balance: parseInt(wwallet.amount, 10), 
                                witdrawal: parseInt(wwallet.totalwitdralamount, 10), 
                                totalIncome: (parseInt(wwallet.amount, 10) + parseInt(wwallet.totalwitdralamount, 10)),
                                lastWitdrawal: parseInt(wwallet.currentwitdralamount, 10)
                            }
                        );
                    }
                    var wprojects = [];

                    var wpVerified = [];
                    var wpCompleted = [];
                    var wpStarted = [];
                    var wpAccepted = [];
                    var wpRejected = [];
                    var wpUnaccessed = [];
                    var project_images = [];

                    var wp_schare = 0;
                    var Searchshare = {}
                    Searchshare = {'id': 1};
                     var verified = false;
                    if (parseInt(users.verify_email, 10) == 1) {
                        verified = true;
                    }

                    Wshear.findByPk(1)
                    .then(springShareDE => {
                        let hht7t = springShareDE;
                        if (!hht7t) {}else{
                            wp_schare = hht7t.wocmanshare;
                        }
                        Projects.findAll({
                            where: Searchwocmanid
                        })
                        .then(projects => {
                            if (!projects) {}else{

                                for (let i = 0; i < projects.length; i++) {

                                    var project_quoteamount = (wp_schare/100) * parseInt(projects[i].quoteamount, 10);

                                    var ppp = (projects[i].images).split(Helpers.padTogether());
                                    for (let i = 0; i <  ppp.length; i++) {
                                            var theimage = Helpers.pathToImages() +  'wocman/projects/'+ ppp[i];
                                        if (fs.existsSync(theimage)) {
                                            theimage = Helpers.coreProjectPath() + theimage;
                                            project_images.push(
                                                [
                                                   theimage 
                                                ]
                                            );
                                        }  
                                    }
                                    if (parseInt(projects[i].wocmanaccept, 10) == 0) {
                                        wpUnaccessed.push(
                                            [{
                                                project_id: projects[i].id, 
                                                project_type_id: projects[i].projectid, 
                                                project_customer_id: projects[i].customerid, 
                                                project_description: projects[i].description, 
                                                project_country: projects[i].country, 
                                                project_state: projects[i].State, 
                                                project_city: projects[i].city, 
                                                project_address: projects[i].address, 
                                                project_date: projects[i].datetimeset, 
                                                project_reward: project_quoteamount, 
                                                project_images: project_images, 
                                                project_start: projects[i].wocmanstartdatetime, 
                                                project_stop: projects[i].wocmanstopdatetime, 
                                                project_customer_complete: projects[i].customeracceptcomplete, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_wocman_complete: projects[i].projectcomplete
                                            }]
                                        );
                                    }
                                    if (parseInt(projects[i].wocmanaccept, 10) == 1) {
                                        
                                        wpRejected.push(
                                            [{
                                                project_id: projects[i].id, 
                                                project_type_id: projects[i].projectid, 
                                                project_customer_id: projects[i].customerid, 
                                                project_description: projects[i].description, 
                                                project_country: projects[i].country, 
                                                project_state: projects[i].State, 
                                                project_city: projects[i].city, 
                                                project_address: projects[i].address, 
                                                project_date: projects[i].datetimeset, 
                                                project_reward: project_quoteamount, 
                                                project_images: project_images, 
                                                project_start: projects[i].wocmanstartdatetime, 
                                                project_stop: projects[i].wocmanstopdatetime, 
                                                project_customer_complete: projects[i].customeracceptcomplete, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_wocman_complete: projects[i].projectcomplete
                                            }]
                                        );
                                    }
                                    if (parseInt(projects[i].wocmanaccept, 10) == 2) {
                                        
                                        wpAccepted.push(
                                            [{
                                                project_id: projects[i].id, 
                                                project_type_id: projects[i].projectid, 
                                                project_customer_id: projects[i].customerid, 
                                                project_description: projects[i].description, 
                                                project_country: projects[i].country, 
                                                project_state: projects[i].State, 
                                                project_city: projects[i].city, 
                                                project_address: projects[i].address, 
                                                project_date: projects[i].datetimeset, 
                                                project_reward: project_quoteamount, 
                                                project_images: project_images, 
                                                project_start: projects[i].wocmanstartdatetime, 
                                                project_stop: projects[i].wocmanstopdatetime, 
                                                project_customer_complete: projects[i].customeracceptcomplete, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_wocman_complete: projects[i].projectcomplete
                                            }]
                                        );
                                    }
                                    if (parseInt(projects[i].wocmanaccept, 10) == 5) {
                                        
                                        wpVerified.push(
                                            [{
                                                project_id: projects[i].id, 
                                                project_type_id: projects[i].projectid, 
                                                project_customer_id: projects[i].customerid, 
                                                project_description: projects[i].description, 
                                                project_country: projects[i].country, 
                                                project_state: projects[i].State, 
                                                project_city: projects[i].city, 
                                                project_address: projects[i].address, 
                                                project_date: projects[i].datetimeset, 
                                                project_reward: project_quoteamount, 
                                                project_images: project_images, 
                                                project_start: projects[i].wocmanstartdatetime, 
                                                project_stop: projects[i].wocmanstopdatetime, 
                                                project_customer_complete: projects[i].customeracceptcomplete, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_wocman_complete: projects[i].projectcomplete
                                            }]
                                        );
                                    }
                                    if (parseInt(projects[i].wocmanaccept, 10) == 4) {
                                        
                                        wpCompleted.push(
                                            [{
                                                project_id: projects[i].id, 
                                                project_type_id: projects[i].projectid, 
                                                project_customer_id: projects[i].customerid, 
                                                project_description: projects[i].description, 
                                                project_country: projects[i].country, 
                                                project_state: projects[i].State, 
                                                project_city: projects[i].city, 
                                                project_address: projects[i].address, 
                                                project_date: projects[i].datetimeset, 
                                                project_reward: project_quoteamount, 
                                                project_images: project_images, 
                                                project_start: projects[i].wocmanstartdatetime, 
                                                project_stop: projects[i].wocmanstopdatetime, 
                                                project_customer_complete: projects[i].customeracceptcomplete, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_wocman_complete: projects[i].projectcomplete
                                            }]
                                        );
                                    }
                                    if (parseInt(projects[i].wocmanaccept, 10) == 3) {
                                        
                                        wpStarted.push(
                                            [{
                                                project_id: projects[i].id, 
                                                project_type_id: projects[i].projectid, 
                                                project_customer_id: projects[i].customerid, 
                                                project_description: projects[i].description, 
                                                project_country: projects[i].country, 
                                                project_state: projects[i].State, 
                                                project_city: projects[i].city, 
                                                project_address: projects[i].address, 
                                                project_date: projects[i].datetimeset, 
                                                project_reward: project_quoteamount, 
                                                project_images: project_images, 
                                                project_start: projects[i].wocmanstartdatetime, 
                                                project_stop: projects[i].wocmanstopdatetime, 
                                                project_customer_complete: projects[i].customeracceptcomplete, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_rate: projects[i].customerratewocman, 
                                                project_wocman_complete: projects[i].projectcomplete
                                            }]
                                        );
                                    }
                                }
                                wprojects.push(
                                    {
                                        Verified: wpVerified, 
                                        Completed: wpCompleted, 
                                        Started: wpStarted, 
                                        Accepted: wpAccepted, 
                                        Rejected: wpRejected, 
                                        Unaccessed: wpUnaccessed
                                    }
                                );
                            }
                            var authorities = 'wocman';
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Found a wocmna user",
                                data: {
                                    Username: users.username,
                                    Email: users.email,
                                    Firstname: users.firstname,
                                    Lastname: users.lastname,
                                    Address: users.address,
                                    Country: users.country,
                                    State: users.state,
                                    Province: users.province,
                                    Phone: users.phone,
                                    Role: authorities,
                                    verify_email: verified,
                                    Profile_picture: profilePictures,
                                    Certificates: certificates,
                                    Projects: wprojects,
                                    Wallet: wallet,
                                    AccessToken: req.token
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

exports.wocmanProfileUpdate = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.userId, 10) === 1) {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        if(req.body.firstname && req.body.firstname !== ''){
            var firstname = req.body.firstname;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,   
                message: "Enter Your Firstname",
                data: []
            });
        }

        if(req.body.lastname && req.body.lastname !== ''){
            var lastname = req.body.lastname;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your Lastname",
                data: []
            });
        }

        if(req.body.address && req.body.address !== ''){
            var address = req.body.address;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your Home/Work Address" ,
                data: []
            });
        }


        if(req.body.phone && req.body.phone !== ''){
            var phone = req.body.phone;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your contact address",
                data: [] 
            });
        }

        if(req.body.country && req.body.country !== ''){
            var country = req.body.country;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your country name",
                data: [] 
            });
        }
        if(req.body.state && req.body.state !== ''){
            var state = req.body.state;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your State name",
                data: []
            });
        }

        if(req.body.province && req.body.province !== ''){
            var province = req.body.province;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your address province",
                data: []
            });
        }

        if(req.body.username && req.body.username !== ''){
            var username = req.body.username;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter Your address username" ,
                data: []
            });
        }

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

            users.update({
              firstname: firstname,
              lastname: lastname,
              address: address,
              phone: phone,
              country: country,
              state: state,
              province: province,
              username:username
            })
            .then( () => {

                var certificates = [];
                Cert.findAll({
                    where: req.userId
                })
                .then(certs => {
                    if (!certs) {
                    }else{
                        for (let i = 0; i < certs.length; i++) {
                          certificates.push(certs[i].name+"::"+Helpers.coreProjectPath() + Helpers.pathToImages() +  'wocman/certificate/'+ certs[i].picture);
                        }
                    }
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Profile Updated",
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

exports.wocmanChangePassword = (req, res, next) => {
    // console.log(req.email_link);
    if (parseInt(req.userId, 10) === 1) {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        var psd = req.body.password;
        if(psd && psd !== '' && psd.length > 7){
            var password = psd;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Enter a valid password. min of 8 characters",
                data: []
            });
        }

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

            users.update({
              password: bcrypt.hashSync(password, 8)
            })
            .then( () => {

                var certificates = [];
                Cert.findAll({
                    where: req.userId
                })
                .then(certs => {
                    if (!certs) {
                    }else{
                        for (let i = 0; i < certs.length; i++) {
                          certificates.push(certs[i].name+"::"+Helpers.coreProjectPath() + Helpers.pathToImages() +  'wocman/certificate/'+ certs[i].picture);
                        }
                    }
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Password was Changed",
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

exports.wocmanAddCertificate = (req, res, next) => {
    var cert_name =  req.body.name;
    var cert_issue_date =  req.body.issued_date;
    var password_link =  req.body.password;

    if (typeof cert_name === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Certificate name field is undefined.",
                data: [] 
            }
        );
    }
    if (typeof cert_issue_date === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Certificate date of issue field is undefined.",
                data: []
            }
        );
    }
    // console.log(req.file);
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

    const file = req.file;//this is the file name
    if (!file) {
        return res.status(400).send({
            statusCode: 400,
            status: false,
            message: "Certificate not uploaded.",
            data: []
        });
    }
    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: "User Not found.",
                data:[]
            });
        }

        Cert.findOne({
            where: {'name' : cert_name }
        }).then(ds34dsd => {
            if (!ds34dsd) {
            }else{
                if (ds34dsd.userid == user_id) {

                    return res.status(404).send({
                        statusCode: 400,
                        status: false,
                        message: "Certificate Already exist for such user",
                        data: []
                    });
                }

            }

            Cert.create({
                userid: user_id,
                name: cert_name,
                issue_date: cert_issue_date,
                picture: file.filename
            })
            .then(hgh  => {
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Certificate was added",
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

exports.wocmanRemoveCertificate = (req, res, next) => {
    var cert_id =  req.body.certificate_id;

    if (typeof cert_id === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Certificate  field is undefined." ,
                data: []
            }
        );
    }
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

    
    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                data: []
            });
        }
        Cert.findByPk(cert_id).then(ds34dsd => {
            if (!ds34dsd) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Certificate Not Found",
                    data: []
            });
            }else{
                if (ds34dsd.userid == user_id) {
                    //delete certificate
                    Cert.destroy({
                        where: {'id': cert_id}
                    })
                    .then(deleteCert => {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Certificate was removed",
                            data: {
                                accessToken:req.token
                            }
                        });
                    })
                    .catch(err => {  res.status(500).send({message: err.message }); });
                }else{
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Certificate ownership Not resolved",
                        data: []
                    });
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

exports.wocmanLogout = (req, res, next) => {
    // Username
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
            loginlogout:1,
            weblogintoken:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImlhdCI6MTYwNDYyOTY3NSwiZXhwIjoxNjA0NzE2MDc1fQ.w9OuLfh-BohX7stJGQyuvXsaKViDMLzqhYwMNaq_0fs'
        });
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Logded Out",
            data: {
                accessToken: null 
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
};

exports.wocmanReuseProfilePicture = (req, res, next) => {
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

        var theimaeg = Helpers.pathToImages() +  'wocman/picture/'+ image.replace(Helpers.coreProjectPath(), '');
        if (!fs.existsSync(theimaeg)) {
            
            return res.status(404).send(
            {
                statusCode: 404,
                status: false,
                message: "Image does not exist.",
                data: []
            }
          );
        }else{
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
                        message: "Profile is re-used",
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
        }
    }
};
