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
const Rootadmin = db.Rootadmin;
const Account = db.Accounts;

const Helpers = require(pathRoot+"helpers/helper.js");

exports.nav = (req, res, next) => {
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

            if (req.isuser == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            var currentImage = [];
            
            if (users.image == null) {}else{
                if (users.image == 'null') {}else{
                    var linkExist =  urlExistSync(users.image);
                    if (linkExist === true) {
                        var theimaeg = users.image;
                        currentImage.push(
                            [
                                theimaeg
                            ]
                        );
                    }
                }
            }
            var isEmailVerified = Helpers.returnBoolean(users.verify_email);
            var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
            var unboard = Helpers.returnBoolean(users.unboard);

            var authorities = 'admin';
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Found an admin user",
                data: {
                    username: users.username,
                    email: users.email,
                    firstname: users.firstname,
                    lastname: users.lastname,
                    profile_picture: currentImage,
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
    }
};

exports.admins = (req, res, next) => {
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

            if (req.isuser == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            UserRole.findAll({
            }).then(checkUsers => {
                if (checkUsers) {
                    for (var i = 0; i < checkUsers.length; i++) {
                        var user_id_check = checkUsers[i].userid;
                        User.findByPk(user_id_check)
                        .then(users_on_check => {
                            if (!users_on_check) {
                                //drop role
                                UserRole.destroy({
                                    where: {'userid': user_id_check}
                                })
                            }
                        })
                    }
                }
            })

            UserRole.findAndCountAll({
                where: {'roleid': 1}
            })
            .then(users_count => {
                var max_admin_users = users_count.count;

                var isEmailVerified = Helpers.returnBoolean(users.verify_email);
                var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
                var unboard = Helpers.returnBoolean(users.unboard);

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found admins",
                    data: {
                        totalAdmins: max_admin_users,
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

exports.wocmen = (req, res, next) => {
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

            if (req.isuser == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            UserRole.findAll({
            }).then(checkUsers => {
                if (checkUsers) {
                    for (var i = 0; i < checkUsers.length; i++) {
                        var user_id_check = checkUsers[i].userid;
                        User.findByPk(user_id_check)
                        .then(users_on_check => {
                            if (!users_on_check) {
                                //drop role
                                UserRole.destroy({
                                    where: {'userid': user_id_check}
                                })
                            }
                        })
                    }
                }
            })

            UserRole.findAndCountAll({
                where: {'roleid': 2}
            })
            .then(users_count => {
                var max_admin_users = users_count.count;

                var isEmailVerified = Helpers.returnBoolean(users.verify_email);
                var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
                var unboard = Helpers.returnBoolean(users.unboard);

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found wocmen",
                    data: {
                        totalWocmen: max_admin_users,
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

exports.customers = (req, res, next) => {
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

            if (req.isuser == 0) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Unauthorized admin",
                    data: []
                });
            }

            UserRole.findAll({
            }).then(checkUsers => {
                if (checkUsers) {
                    for (var i = 0; i < checkUsers.length; i++) {
                        var user_id_check = checkUsers[i].userid;
                        User.findByPk(user_id_check)
                        .then(users_on_check => {
                            if (!users_on_check) {
                                //drop role
                                UserRole.destroy({
                                    where: {'userid': user_id_check}
                                })
                            }
                        })
                    }
                }
            })

            UserRole.findAndCountAll({
                where: {'roleid': 3}
            })
            .then(users_count => {
                var max_admin_users = users_count.count;

                var isEmailVerified = Helpers.returnBoolean(users.verify_email);
                var isProfileUpdated = Helpers.returnBoolean(users.profileupdate);
                var unboard = Helpers.returnBoolean(users.unboard);

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found Customers",
                    data: {
                        totalCustomers: max_admin_users,
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