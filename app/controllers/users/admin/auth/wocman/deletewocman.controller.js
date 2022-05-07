const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const Role = db.Role;
const UserRole = db.UserRole;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const {v4 : uuidv4} = require('uuid');
const Joi = require('joi'); 
let nodeGeocoder = require('node-geocoder');
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

exports.deleteWocman = (req, res, next) => {
    var ids = req.params.id;
    UserRole.findOne({
        where: {userid: ids}
    })
    .then(userrole => {
        Role.findOne({
            where: {id: userrole.roleid}
        }).then(roles => {
            if (!(roles.name == 'wocman')) {
                return res.status(400).send({
                    statusCode: 400,
                    status: false,
                    message: "Not A Wocman Profile",
                    data: []
                });
            }
            UserRole.destroy({
                where: {userid: ids}
            })
            .then(result => {
                User.destroy({
                    where: {id: ids}
                })
                .then(result => {
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Deleted Admin Profile",
                        data: []
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
    })
    .catch((err)=> {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};