const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const Wsetting = db.Wsetting;

const Helpers = require(pathRoot+"helpers/helper.js");


exports.wpssettings = (req, res, next) => {
    var searchuserid = [];
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        if(req.userId && req.userId !== ''){
            searchuserid = {'userid': req.userId};
        }else{
            searchuserid = {'userid': {$not: null}};
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

            Wsetting.findOne({
                where: searchuserid
            })
            .then(wsettings => {
                if (!wsettings) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User has no settings.",
                        data: []
                    });
                }

                const pushUser = users.id;
                const pushType = 'service';
                const pushBody = 'Dear ' + users.username + ", <br />You have Set Up your payment schedule " +
                                "to be weekly. <br /> This Would take Effect From Next Payment Shift. " +
                                "<br/> This could also be on a monthly interval.";

                Helpers.pushNotice(pushUser, pushBody, pushType);

                Wsetting.update(
                    {
                    paymentschedule: 1
                    }, 
                    {
                        where : {id: wsettings.id}
                    }
                ).then( newsettings => {

                    Wsetting.findOne({
                        where: searchuserid
                    })
                    .then(updatedsettings => {
                        var paymentschedule = Helpers.returnBoolean(updatedsettings.paymentschedule);
                        var isWeekly = false;
                        var isMonthly = false;
                        if (paymentschedule === true) {
                            paymentschedule = 'weekly';
                            isWeekly = true;
                        }
                        if (paymentschedule === false) {
                            paymentschedule = 'monthly';
                            isMonthly = true;
                        }

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                weekly: isWeekly,
                                monthly: isMonthly,
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
                        statusCode: 5050,
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
exports.nwpssettings = (req, res, next) => {
    
    var searchuserid = [];
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
            var unboard = Helpers.returnBoolean(users.unboard);


            if(req.userId && req.userId !== ''){
                searchuserid = {'userid': req.userId};
            }else{
                searchuserid = {'userid': {$not: null}};
            }
           
            Wsetting.findOne({
                where: searchuserid
            })
            .then(wsettings => {
                if (!wsettings) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User has no settings.",
                        data: []
                    });
                }

                const pushUser = users.id;
                const pushType = 'service';
                const pushBody = 'Dear ' + users.username + ", <br />You have Set Up your payment mode " +
                                "to be monthly. <br /> This would be effected on your next payment shift. " +
                                "<br />This could also be weekly based.";

                Helpers.pushNotice(pushUser, pushBody, pushType);

                Wsetting.update(
                    {
                        paymentschedule: 0
                    }, 
                    {
                        where : {id: wsettings.id}
                    }
                ).then( newsettings => {

                    Wsetting.findOne({
                        where: searchuserid
                    })
                    .then(updatedsettings => {
                        var paymentschedule = Helpers.returnBoolean(updatedsettings.paymentschedule);
                        var isWeekly = false;
                        var isMonthly = false;
                        if (paymentschedule === true) {
                            paymentschedule = 'weekly';
                            isWeekly = true;
                        }
                        if (paymentschedule === false) {
                            paymentschedule = 'monthly';
                            isMonthly = true;
                        }

                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Notification Settings Updated",
                            data: {
                                weekly: isWeekly,
                                monthly: isMonthly,
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
            })
            .catch(err => {
                res.status(500).send({
                    statusCode: 5050,
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