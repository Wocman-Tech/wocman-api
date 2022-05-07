const pathRoot = '../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Nletter = db.Nletter;
const Contactus = db.Contactus;




const Op = db.Sequelize.Op;

exports.subscribenewsletter = (req, res, next) => {

    var emailAddress =  req.body.email;
    if (typeof emailAddress === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "email is undefined.",
                data: []
            }
        );
    }else{

        Nletter.findAndCountAll({
            where: {email: emailAddress}
        })
        .then(result => {
            // console.log(result);
            if (result.count == 0) {
               Nletter.create({
                    email: emailAddress
                })
                .then(hgh  => {
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: 'Successful newsletter subscription',
                        data: []
                    });
                })
                .catch(err => {
                    res.status(500).send({ message: err.message });
                });
            }else{
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Email Already subscribed",
                    data: []
                });
            }
        })
        .catch((err)=> {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    }
};