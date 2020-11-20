const db = require("../models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Helpers = require("../helpers/helper.js");

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    User.findOne({
        where: {
          username: req.body.username
        }
    }).then(user => {
        if (user) {
            res.status(404).send({
                statusCode: 404,
                status: false,
                message: "Failed! Username is already in use!",
                data: []
            });
            return;
        }

        // Email
        User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
          if (user) {
            res.status(404).send({
                statusCode: 404,
                status: false,
                message: "Failed! Email is already in use!",
                data: []
            });
            return;
          }
          next();
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
};

checkRolesExisted = (req, res, next) => {

   if (typeof req.body.email === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Email field is undefined.",
                data: []
            }
        );
    }else{
        var searchemail = {};
        var userId = {};
       
        if(req.body.email && req.body.email !== ''){
            searchemail = {'email': req.body.email}
        }else{
            searchemail = {'email': {$not: null}};
        }
        User.findOne({
            where: searchemail
        })
        .then(users => {
            if (!users) {
                return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User Not found.",
                        data: []
                    });
            }
            if(users.id && users.id !== ''){
                userId = {'userid': users.id}
            }else{
                userId = {'userid': {$not: null}};
            }

            UserRole.findOne({
                where: userId
            })
            .then(userrole => {
                if (!userrole) {
                    UserRole.create({
                        userid: users.id,
                        roleid: 2
                    });
                }
                next();
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

const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;