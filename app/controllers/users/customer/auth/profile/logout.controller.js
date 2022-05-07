const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");


const Op = db.Sequelize.Op;

exports.customerLogout = (req, res, next) => {
    // Username
    User.findByPk(req.userId).then(user => {
        if (!user) {
          res.status(400).send({
            statusCode: 400,
            status: false,
            message: "User Not Found",
            data: []
          });
          return;
        }
        req.session = null;
        user.update({
            loginlogout:1,
            weblogintoken:'eyJhbr432iJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MT765mlhdCI6MTYwNDYyOTY3NSwiZXhwIjoxNjA0NzE2MDc1fQ.w9OuLfh-BohX7stJGQyuvXs5lkKMLzqhYwMNaq_0fs'
        });
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Logged Out",
            data: {
                accessToken: null 
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
};