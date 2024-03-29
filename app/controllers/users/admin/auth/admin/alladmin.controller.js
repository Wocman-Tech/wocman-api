const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Nletter = db.Nletter;
const Contactus = db.Contactus;

const Projects = db.Projects;
const Project = db.Projecttype;
const Wshear = db.Wshear;
const WAChat = db.WaChat;
const WCChat = db.WcChat;
const WWallet = db.WWallet;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const {v4 : uuidv4} = require('uuid');
const Joi = require('joi'); 
const Mailgen = require("mailgen");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
 
let options = {
  provider: 'openstreetmap'
};

exports.allAdmin = (req, res, next) => {
    var userid = [];
    var id = [];
    UserRole.findAll({
        where: {roleid: 1}
    })
    .then(resultRole => {
        if (!resultRole) {
            return res.status(401).send({
                statusCode: 401,
                status: false,
                message: "User role not found",
                data: []
            });
        }
        for (var i = 0; i < resultRole.length; i++) {
            userid.push(resultRole[i].userid);
        }
        User.findAll({
        })
        .then(resultUser => {
            if (!resultUser) {
                return res.status(401).send({
                    statusCode: 401,
                    status: false,
                    message: "User not found",
                    data: []
                });
            }
            for (var i = 0; i < resultUser.length; i++) {
                id.push(resultUser[i].id);
            }
            var pure = [];
            for (var i = 0; i < id.length; i++) {
                if(userid.includes(id[i]) === true){
                    pure.push(id[i]);
                }
            }

            var msg = "Found "+pure.length+ " Admin";
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: msg,
                data: pure
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