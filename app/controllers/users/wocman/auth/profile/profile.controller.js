const pathRoot = '../../../../../';
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
const wWalletH = db.wWalletH;
const Wrate = db.wrate;
const WNotice = db.wNotice;

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


exports.wocmanProfile = (req, res, next) => {
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
            var rateUser = 0;
            var rateUserCount = 0;
            Wrate.findAll({
                where: Searchuserid
            })
            .then(wrate => {
                if (!wrate) {}else{

                    for (let i = 0; i < wrate.length; i++) {
                        rateUserCount = rateUserCount + 1;
                        rateUser = rateUser + parseInt(wrate[i].rateUser, 10);
                    }
                }
            });
            if (rateUser > 0 && rateUserCount > 0) {
                rateUserWocman = rateUser/rateUserCount;
            }else{
                rateUserWocman = 0;
            }

            var notice = [];
            
            WNotice.findAll({
                where: Searchuserid
            })
            .then(wnotice => {
                if (!wnotice) {}else{

                    for (let i = 0; i < wnotice.length; i++) {
                        if (parseInt(wnotice[i].seen, 10) == 0) {
                            notice.push(
                                {
                                    notice: wnotice[i].notice, 
                                    type: wnotice[i].type,
                                    date: wnotice[i].date
                                }
                            );
                        }
                    }
                }
            });

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
                                lastWitdrawal: parseInt(wwallet.currentwitdralamount, 10),
                                walletId: wwallet.walletid,
                                accountType: wwallet.accType,
                                bankName: wwallet.bankName,
                                accountNumber: wwallet.accNumber,
                                accountName: wwallet.accName
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
                                    Notice: notice,
                                    AccessToken: req.token,
                                    Unboard: users.unboard,
                                    Rate: rateUserWocman
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