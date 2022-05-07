const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;

const Projects = db.Projects;

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

const Op = db.Sequelize.Op;

exports.projects_complete_filter = (req, res, next) => {
    var date_filter = req.body.date_filter;
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User was not found",
            data: [] 
        });
    }else{
        if (typeof date_filter == "undefined") {
            return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "include date_filter field",
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

            if (req.isproject == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            var filter = '`%'+date_filter+'%`';
            Projects.findAll({
                where: {
                        'projectcomplete': 1,
                        // 'updatedAt': { [Op.Like]: filter }
                    }
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has been completed",
                        data: []
                    });
                }
                
                var theProjects = [];

                for (var i = 0; i < checkUsers.length; i++) {
                    var str = checkUsers[i].createdAt.toString();
                    if (typeof str == 'string'){
                        if(str.includes(date_filter.toString())) {
                            theProjects.push({checkUsers});
                        }
                    }
                }

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found completed Projects",
                    data: {
                        projects: theProjects,
                        accessToken: req.token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
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

exports.projects_quotation = (req, res, next) => {
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

            if (req.isproject == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }
            var filter = 'http';
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            Projects.findAll({
                where: {
                    'projectcomplete': 0,
                    // 'quoteamount': { [Op.Like]: filter }
                }
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has not been completed",
                        data: []
                    });
                }

                var quote = [];

                for (var i = 0; i < checkUsers.length; i++) {
                    if (checkUsers[i].quoteamount == null) {
                        var str = 'null';
                    }else{
                        var str = checkUsers[i].quoteamount.toString();
                    }

                    if (typeof str == 'string'){
                        if(str.includes(filter.toString())) {
                            quote.push({checkUsers});
                        }
                    }
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Projects with quotation",
                    data: {
                        project: quote,
                        accessToken: req.token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
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

exports.projects_no_quotation = (req, res, next) => {
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

            if (req.isproject == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }
            var filter = 'null';
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            Projects.findAll({
                where: {
                    'projectcomplete': 0,
                    // 'quoteamount': { [Op.Like]: filter }
                }
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has not been completed",
                        data: []
                    });
                }

                var quote = [];

                for (var i = 0; i < checkUsers.length; i++) {
                    if (checkUsers[i].quoteamount === null) {
                        var str = 'null';
                    }else{
                        var str = checkUsers[i].quoteamount.toString();
                    }
                    // console.log(str);

                    if (typeof str == 'string'){
                        if(str.includes(filter.toString())) {
                            quote.push({checkUsers});
                        }
                    }
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Projects with no quotation",
                    data: {
                        project: quote,
                        accessToken: req.token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
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

exports.projects_schedule = (req, res, next) => {
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

            if (req.isproject == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }
            var filter = 'null';
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            Projects.findAll({
                where: {
                    'projectcomplete': 0,
                    // 'datetimeset': { [Op.Like]: filter }
                }
            }).then(checkUsers => {
                if (!checkUsers) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "No project has not been completed",
                        data: []
                    });
                }

                var quote = [];

                for (var i = 0; i < checkUsers.length; i++) {

                    if (checkUsers[i].datetimeset == null) {
                        var str = 'null';
                    }else{
                        var str = checkUsers[i].datetimeset.toString();
                    }

                    if (typeof str == 'string'){
                        if(str.includes(filter.toString())) {
                        }else{
                            quote.push({checkUsers});
                        }
                    }
                }
           
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Projects with schedule",
                    data: {
                        project: quote,
                        accessToken: req.token,
                        isEmailVerified: isEmailVerified,
                        isProfileUpdated: isProfileUpdated,
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

