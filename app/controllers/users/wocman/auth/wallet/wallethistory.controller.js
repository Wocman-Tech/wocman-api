const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.user;
const Role = db.role;
const UserRole = db.userRole;

const WWallet = db.wWallet;
const WWalletH = db.wWalletH;

const WAccount = db.accounts;

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

exports.walletDetailsHistory = (req, res, next) => {
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
            }else{
                Searchuserid = {'userid': {$not: null}};
            }
            var unboard = Helpers.returnBoolean(users.unboard);


            WWalletH.findAll({
                where: Searchuserid
            })
            .then(wwallet => {
                if (!wwallet) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Wallet Not Found",
                        data: {
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }else{
                    
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Found a wocmna user",
                        data: {
                            history: wwallet,
                            name: users.firstname+ " " +users.lastname,
                            accessToken: req.token,
                            unboard: unboard
                        }
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

exports.mapChart = (req, res, next) => {

    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        if (typeof req.body.fulldate == "undefined") {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "fulldate field is not defined",
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
            
            var unboard = Helpers.returnBoolean(users.unboard);
            const searchuserid = {'wocmanid': req.userId};
    
            WAccount.findAll({
                where: searchuserid
            })
            .then(searchChart => {
                if (!searchChart) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman income history Not Found",
                        data: {}
                    });
                }
                let sunTotal = 0;
                let monTotal = 0;
                let tueTotal = 0;
                let wedTotal = 0;
                let thuTotal = 0;
                let friTotal = 0;
                let satTotal = 0;

                let totalFewMonths = 0;
                const monthNames = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ];

                let actualDate = req.body.fulldate;
                let checks = new Date(actualDate);

                if (checks == "Invalid Date" && isNaN(checks)) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Your Date is Invalid",
                        data: {}
                    });
                }

                var thisMonthDate = checks.getMonth();
                var thisYearDate = checks.getFullYear();

                var lastMonth = thisMonthDate - 1;

                var lastTwoMonth = thisMonthDate - 2;

                if (thisMonthDate == 0) {
                    var lastMonth =  11;
                    var lastTwoMonth =  10;
                    var chartDate = monthNames[lastMonth]+ " "+ thisYearDate +" - "+ monthNames[thisMonthDate]+" "+thisYearDate;
                }else{
                    var chartDate = monthNames[lastMonth]+ " - "+ monthNames[thisMonthDate]+" "+thisYearDate;
                }

                for (var i = 0; i < searchChart.length; i++) {

                    let dateSearch = searchChart[i].createdAt;

                    let today = dateSearch.getDay();
                    let dataMonth = dateSearch.getMonth();
                    let dataYear = dateSearch.getFullYear();

                    if (parseInt(searchChart[i].closeAccount, 10) == 1) {
                        if (thisYearDate == dataYear) {
                        
                            if (dataMonth == thisMonthDate) {

                                if (today == 0) {
                                    //sun
                                    sunTotal = sunTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 1) {
                                    //mon
                                    monTotal = monTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 2) {
                                    //tue
                                    tueTotal = tueTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 3) {
                                    //wed
                                    wedTotal = wedTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 4) {
                                    //thu
                                    thuTotal = thuTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 5) {
                                    //thu
                                    friTotal = friTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 6) {
                                    //thu
                                    satTotal = satTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }
                            }

                            if (dataMonth == lastMonth) {

                                if (today == 0) {
                                    //sun
                                    sunTotal = sunTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 1) {
                                    //mon
                                    monTotal = monTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 2) {
                                    //tue
                                    tueTotal = tueTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 3) {
                                    //wed
                                    wedTotal = wedTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 4) {
                                    //thu
                                    thuTotal = thuTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 5) {
                                    //thu
                                    friTotal = friTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                if (today == 6) {
                                    //thu
                                    satTotal = satTotal + parseInt(searchChart[i].wocmanreceived, 10);
                                }

                                totalFewMonths = totalFewMonths + parseInt(searchChart[i].wocmanreceived, 10);
                            }

                            if (dataMonth == lastTwoMonth) {
                                totalFewMonths = totalFewMonths + parseInt(searchChart[i].wocmanreceived, 10);
                            }
                        }
                    }
                }

                var totalRevenue = monTotal + tueTotal + wedTotal + thuTotal + friTotal + satTotal + sunTotal;
                var percentage = '';
                if (totalFewMonths > totalRevenue) {
                    let difference = totalFewMonths - totalRevenue;
                    percentage = "-"+(difference / totalRevenue) * 100;
                }else{
                    let difference = totalRevenue - totalFewMonths;
                    percentage = "+"+(difference / totalRevenue) * 100;
                }
                
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "success",
                    data: {
                        chartTag: chartDate,
                        mon: monTotal,
                        tue: tueTotal,
                        wed: wedTotal,
                        thu: thuTotal,
                        fri: friTotal,
                        sat: satTotal,
                        sun: sunTotal,
                        totalRevenue: totalRevenue,
                        revenueProgress: percentage,
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
}