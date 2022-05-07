const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;

exports.oneWocman = (req, res, next) => {
    var idf = req.params.id;
    UserRole.findOne({
        where: {userid: idf}
    })
    .then(resultRole => {
        if (!resultRole) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User role Not Found",
                data: []
            });
        }
        if (!(resultRole.roleid == 2 )) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not a wocman",
                data: []
            });
        }
        User.findOne({
            where: {id: idf}
        })
        .then(resultUser => {
            if (!resultUser) {
                 return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "User Not Found",
                    data: []
                });
            }
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Wocman was found",
                data: resultUser
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