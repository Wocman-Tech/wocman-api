const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const Cert = db.Cert;
const Skills = db.Skills;
const Wskills = db.Wskills;
const Competency = db.Competency;
const Wcompetency = db.Wcompetency;
const Category = db.Category;
const Wcategory = db.Wcategory;

const urlExistSync = require("url-exist-sync");


const Projects = db.Projects;
const Project = db.Projecttype;
const Wshear = db.Wshear;
const WWallet = db.WWallet;
const Wrate = db.Wrate;
const WNotice = db.WNotice;

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
                    if (!Array.isArray(wrate) || !wrate.length) {
                    }else{
                        for (let i = 0; i < wrate.length; i++) {
                            rateUserCount = rateUserCount + 1;
                            rateUser = rateUser + parseInt(wrate[i].rateUser, 10);
                        }
                    }
                }
            });
            if (rateUser > 0 && rateUserCount > 0) {
                rateUserWocman = rateUser/rateUserCount;
            }else{
                rateUserWocman = 0;
            }

            var skills = [];
            Skills.findAll()
            .then(skillsg6 => {
                if (!skillsg6) {}else{
                    if (!Array.isArray(skillsg6) || !skillsg6.length) {
                    }else{
                        for (var i = 0; i < skillsg6.length; i++) {

                            const skillname = skillsg6[i].name;
                            var skillid = skillsg6[i].id;
                            var category_id = skillsg6[i].categoryid;

                            Wskills.findOne({
                                where: {'userid': req.userId, 'skillid': skillid}
                            })
                            .then(wskills => {
                                if (!wskills) {}else{
                                    if ('dataValues' in wskills) {
                                        var skillsId = wskills.id;
                                        var description = wskills.description;
                                        Category.findOne({
                                            where: {id: category_id}
                                        })
                                        .then(wcategory => {
                                            if (!wcategory) {}else{
                                                if ('dataValues' in wcategory) {
                                                    skills.push(
                                                        {
                                                            id: skillsId,
                                                            category: wcategory.name,
                                                            name: skillname,
                                                            description:description
                                                        }
                                                    );
                                                }
                                            } 
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            });

            var notice = [];
            
            WNotice.findAll({
                where: Searchuserid
            })
            .then(wnotice => {
                if (!wnotice) {}else{
                    if ('dataValues' in wnotice) {
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
                }
            });
            var competence = [];
            Wcompetency.findOne({
                where: Searchuserid
            })
            .then(wcompetency => {
                if (!wcompetency) {}else{
                    if ('dataValues' in wcompetency) {
                        var competency_id = wcompetency.competencyid;
                        Competency.findOne({
                            where: {id: competency_id}
                        })
                        .then(isCompetency => {
                            if (!isCompetency) {}else{
                                if ('dataValues' in isCompetency) {
                                    competence.push(
                                        {
                                            competency: isCompetency.name, 
                                        }
                                    );
                                }
                            }
                        });
                    } 
                }
            });

            var category = [];
            Wcategory.findOne({
                where: Searchuserid
            })
            .then(wcategory => {
                if (!wcategory) {}else{
                    if ('dataValues' in wcategory) {
                        var category_id = wcategory.categoryid;
                        Category.findOne({
                            where: {id: category_id}
                        })
                        .then(isCategory => {
                            if (!isCategory) {}else{
                                category.push(
                                    {
                                        category: isCategory.name, 
                                    }
                                );
                            }
                        }); 
                    }
                }
            });

            var profilePictures = [];
            var otherImages = [];
            var currentImage = [];

            if (typeof users == "undefined") {
            }else{

                if (users.images == null) {
                    var otherImages = [];
                }else{
                    if (users.images == 'null') {
                        var otherImages = [];
                    }else{
                        var pp = (users.images).split(Helpers.padTogether());
                        for (let i = 0; i <  pp.length; i++) {
                            if (pp[i] !== users.image) {
                                if (pp[i] == 'null') {}else{
                                    var linkExist =  urlExistSync(pp[i]);
                                    if (linkExist === true) {
                                        var theimaeg = pp[i];
                                        otherImages.push(
                                            [
                                                theimaeg
                                            ]
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
                if (users.image == null) {}else{
                    if (users.image == 'null') {}else{
                        var linkExist =  urlExistSync(users.image);
                        if (linkExist === true) {
                            var theimaeg = users.image;
                            currentImage.push(
                                [
                                    theimaeg
                                ]
                            );
                        }
                    }
                }

                profilePictures.push(
                    {
                        current: currentImage, 
                        others: otherImages
                    }
                );
            }

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
                    if (!Array.isArray(certs9o) || !certs9o.length) {
                    }else{
                        for (let i = 0; i < certs9o.length; i++) {
                            var linkExist =  urlExistSync(certs9o[i].picture);

                            if (linkExist === true) {
                                var theimaeg = certs9o[i].picture;
                            }else{
                                var theimaeg = '';
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
                        if (!Array.isArray(wwallet) || !wwallet.length) {
                        }else{
                            var froozen = Helpers.returnBoolean(wwallet.froozeaccount);

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
                                    accountName: wwallet.accName,
                                    froozen: froozen,
                                    name: users.firstname+" "+users.lastname
                                }
                            );
                        }
                    }
                    var wprojects = [];

                    var wpVerified = [];
                    var wpCompleted = [];
                    var wpStarted = [];
                    var wpAccepted = [];
                    var wpRejected = [];
                    var wpUnaccessed = [];
                    var project_images = [];
                    var wpSchedules = [];

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
                        const wpCustomer = []
                        Projects.findAll({
                            where: Searchwocmanid
                        })
                        .then(async projects => {
                            if (!projects) {}else{
                                if (!Array.isArray(projects) || !projects.length) {
                                }else{

                                    for await (const project of projects){

                                        // Make sure to wait on all your sequelize CRUD calls
                                        const prod = await Project.findByPk(project.projectid)

                                        // It will now wait for above Promise to be fulfilled and show the proper details
                                        console.log(prod)

                                        const cust = await User.findByPk(project.customerid)

                                        // It will now wait for above Promise to be fulfilled and show the proper details
                                        console.log(cust)

                                        let cartItem3 = {}
                                        const customer_name = cust.firstname +" "+ cust.lastname

                                        cartItem3.projectType = prod.name
                                        cartItem3.customer = customer_name
                                       
                                        // Simple push will work in this loop, you don't need to return anything
                                        wpCustomer.push(cartItem3)
                                    }

                                    for (let i = 0; i < projects.length; i++) {

                                        if (typeof projects[i] == "undefined") {
                                        }else{

                                            var project_quoteamount = (wp_schare/100) * parseInt(projects[i].quoteamount, 10);
                                            if (projects[i].images == null) {
                                                
                                            }else{
                                                if (projects[i].images == 'null') {
                                                   
                                                }else{
                                                    var ppp = (projects[i].images).split(Helpers.padTogether());
                                                    for (let i = 0; i <  ppp.length; i++) {
                                                        var linkExist =  urlExistSync(projects[i].images);

                                                        if (linkExist === true) {
                                                            var theimage = projects[i].images;
                                                            project_images.push(
                                                                [
                                                                   theimage 
                                                                ]
                                                            );
                                                        }  
                                                    }
                                                }
                                            }
                                            

                                            if (parseInt(projects[i].wocmanaccept, 10) == 0) {
                                                wpUnaccessed.push(
                                                    [{
                                                        project_id: projects[i].id,
                                                        project_customer: wpCustomer, 
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
                                                        project_customer: wpCustomer,  
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
                                                        project_customer: wpCustomer,
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
                                                wpSchedules.push(
                                                    [
                                                        {
                                                            project_id: projects[i].id, 
                                                            project_type: wpCustomer,
                                                            project_description: projects[i].description, 
                                                            schedule: projects[i].datetimeset
                                                        }
                                                    ]
                                                );
                                            }
                                            if (parseInt(projects[i].wocmanaccept, 10) == 5) {
                                                
                                                wpVerified.push(
                                                    [{
                                                        project_id: projects[i].id, 
                                                        project_customer: wpCustomer, 
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
                                                        project_customer: wpCustomer, 
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
                                                        project_customer: wpCustomer,
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
                            }
                            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
                            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
                            var isCertificateUploaded = Helpers.returnBoolean(users.certificatesupdate);
                            var unboard = Helpers.returnBoolean(users.unboard);
                            var isSkilled = Helpers.returnBoolean(users.isSkilled);

                            var authorities = 'wocman';
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Found a wocman user",
                                data: {
                                    username: users.username,
                                    email: users.email,
                                    firstname: users.firstname,
                                    lastname: users.lastname,
                                    address: users.address,
                                    country: users.country,
                                    state: users.state,
                                    province: users.province,
                                    phone: users.phone,
                                    role: authorities,
                                    profile_picture: profilePictures,
                                    certificates: certificates,
                                    projects: wprojects,
                                    schedule: wpSchedules,
                                    wallet: wallet,
                                    notice: notice,
                                    skills: skills,
                                    competence: competence,
                                    accessToken: req.token,
                                    rate: rateUserWocman,
                                    isEmailVerified: isEmailVerified,
                                    isProfileUpdated: isProfileUpdated,
                                    isCertificateUploaded: isCertificateUploaded,
                                    isSkilled: isSkilled,
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