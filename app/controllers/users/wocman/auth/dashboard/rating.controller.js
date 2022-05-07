const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const Wrate = db.Wrate;

const Helpers = require(pathRoot+"helpers/helper.js");


exports.rating = (req, res, next) => {
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
            var unboard = Helpers.returnBoolean(users.unboard);

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
                if (!wrate) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Rate Not Found",
                        data: {
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }else{

                    for (let i = 0; i < wrate.length; i++) {
                        rateUserCount = rateUserCount + 1;
                        rateUser = rateUser + parseInt(wrate[i].rateUser, 10);
                    }
                }
                if (rateUser > 0 && rateUserCount > 0) {
                    rateUserWocman = rateUser/rateUserCount;
                }else{
                    rateUserWocman = 0;
                }
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found a wocmna user",
                    data: {
                        rate: rateUserWocman,
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