const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const WWallet = db.WWallet;

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

exports.wwDetails = (req, res, next) => {
    

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
            Searchuserid = {'userid': req.userId};
        }else{
            Searchuserid = {'userid': {$not: null}};
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

           
            WWallet.findOne({
                where: Searchuserid
            })
            .then(wwallet => {
                if (!wwallet) {
                    return res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Wallet Details Not Found",
                        data: {
                            walletDettails: 'User is not unboarded yet and so cannot set up bank and wallet details',
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }
                var froozen = Helpers.returnBoolean(wwallet.froozeaccount);
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Wallet Details  Found",
                    data: {
                        walletDettails: wwallet,
                        accessToken: req.token,
                        unboard: unboard,
                        frozen: frozen
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
exports.wchangeBankDetails = (req, res, next) => {
    
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

        var bankName = req.body.bankName;
        var accNumber = req.body.accNumber;
        var accName = req.body.accName;
        var accType = req.body.accType;

        if(bankName && bankName !== ''){
            var bankName = bankName;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Invalid bankName field",
                data: []
            });
        }

        if(accNumber && accNumber !== ''){
            var accNumber = accNumber;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Invalid accNumber field",
                data: []
            });
        }

        if(accName && accName !== ''){
            var accName = accName;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Invalid accName field",
                data: []
            });
        }

        if(accType && accType !== ''){
            var accType = accType;
        }else{
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Invalid accType field",
                data: []
            });
        }

        //schema
        const joiCleanSchema = Joi.object().keys({ 
            bankName: Joi.string().min(1).max(225).required(), 
            accNumber: Joi.string().min(1).max(225).required(),
            accName: Joi.string().min(1).max(225).required(),
            accType: Joi.string().min(1).max(225).required(),
        }); 
        const dataToValidate = {
          bankName: bankName,
          accNumber: accNumber,
          accName: accName,
          accType: accType
        }
        const joyResult = joiCleanSchema.validate(dataToValidate);
        if (joyResult.error == null) {
        }else{
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: joyResult.error,
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
            if(req.userId && req.userId !== ''){
                searchuserid = {'userid': req.userId};
            }else{
                searchuserid = {'userid': {$not: null}};
            }
           
            WWallet.findOne({
                where: searchuserid
            })
            .then(wsettings => {
                if (!wsettings) {
                    return res.status(400).send(
                    {
                        statusCode: 400,
                        status: false,
                        message: "Wocman Wallet Not Found",
                        data: []
                    });
                }

                WWallet.update(
                    {
                        bankName: bankName,
                        accNumber: accNumber,
                        accName: accName,
                        accType: accType
                    }, 
                    {
                        where : {walletid: wsettings.walletid}
                    }
                ).then( newsettings => {

                    const pushUser = users.id;
                    const pushType = 'service';
                    const pushBody = 'Dear ' + users.username + ", <br />You have Changed your bank Details. " +
                                " <br />Please report to admin if this changes was not made by you so that we can frooze your wallet until the issue is resolved.";

                    Helpers.pushNotice(pushUser, pushBody, pushType);

                    var froozen = Helpers.returnBoolean(newsettings.froozeaccount);


                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Bank Details Updated",
                        data: {
                            walletDetails: newsettings,
                            accessToken: req.token,
                            unboard: unboard,
                            frozen: frozen
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
    }
};