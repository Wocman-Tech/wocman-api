const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const Projects = db.Projects;
const Joi = require('joi'); 

const Helpers = require(pathRoot+"helpers/helper.js");

const Op = db.Sequelize.Op;
exports.wocmanContactCustomer = (req, res, next) => {
    // Username
    var wocmanid =  req.params.wocmanid;
    
    if (typeof wocmanid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "wocmanid  field is undefined.",
                data: [] 
            }
        );
    }else{

        //schema
        const joiClean = Joi.object().keys({ 
            wocmanid: Joi.number().integer().min(1), 
        }); 
        const dataToValidate = { 
          wocmanid: wocmanid 
        }
        // const result = Joi.validate(dataToValidate, joiClean);
        const result = joiClean.validate(dataToValidate);
        if (result.error == null) {
        
            User.findByPk(req.userId).then(user => {
                if (!user) {
                    res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User Not Found",
                        data: []
                    });
                    return;
                }
                var unboard = Helpers.returnBoolean(user.unboard);
                var gg = 0;
                Projects.findAll({
                    where: {
                        wocmanid: wocmanid,
                        customerid: req.userId,
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }).then(project => {


                    if (!project) {
                        res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "Customer has no relationship with Wocman currently",
                            data: []
                        });
                        return;
                    }
                    for (var i = 0; i < project.length; i++) {
                        if (parseInt(project[i].wocmanaccept, 10) > 1 && parseInt(project[i].wocmanaccept, 10) < 5) {
                            gg = gg + 1;
                        }
                    }
                    if (gg > 0) {

                        User.findByPk(wocmanid).then(customeruser => {
                            if (!customeruser) {
                                res.status(404).send({
                                    statusCode: 404,
                                    status: false,
                                    message: "Wocman Not Found",
                                    data: []
                                });
                                return;
                            }
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Wocman was found",
                                data: {
                                    accessToken: req.token,
                                    wocman_username: customeruser.username,
                                    wocman_firstname: customeruser.firstname,
                                    wocman_lastname: customeruser.lastname,
                                    wocman_phone: customeruser.phone,
                                    wocman_email: customeruser.email,
                                    wocman_address: customeruser.address,
                                    wocman_country: customeruser.country,
                                    wocman_image: customeruser.image,
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
                    }else{
                        return res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "Customer has no relationship with Wocman currently",
                            data: []
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
         }else{
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: "Invalid wocmanid",
                    data: []
                }
            );
        }
    }
};