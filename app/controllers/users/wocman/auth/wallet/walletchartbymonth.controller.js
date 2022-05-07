const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const WWalletH = db.WWalletH;

const Helpers = require(pathRoot+"helpers/helper.js");

const Op = db.Sequelize.Op;

exports.walletDetails = (req, res, next) => {
    // console.log(req.email_link);
    var date =  req.body.date;

    function formatDate(datef){
        var d = new Date(datef);
        month = '' + (d.getMonth() +  1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + month;
        }
        return [year, month, day];
    }

    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{

        if (typeof date == 'undefined') {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "date was not found",
                data: [] 
            });
        }else{

            var month = formatDate(date)[0]+"-"+ formatDate(date)[1];
            // console.log(month);

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

               
                WWalletH.findAll({
                    where: {
                        userid: req.userId,
                        wallethistorydate: {
                            [Op.like]: '%'+month+'%'
                        }
                    }
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
                            message: "Found a wocman user",
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
    }
};