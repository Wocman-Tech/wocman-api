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

const Op = db.Sequelize.Op;
exports.wocmanContactCustomer = (req, res, next) => {
    // Username
    var customerid =  req.body.customerid;
    
    if (typeof customerid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "customerid  field is undefined.",
                data: [] 
            }
        );
    }else{

        //schema
        const joiClean = Joi.object().keys({ 
            customerid: Joi.string().min(1), 
        }); 
        const dataToValidate = { 
          customerid: customerid 
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
                        wocmanid: req.userId,
                        customerid: customerid,
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }).then(project => {

                    if (!project) {
                      res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman has no relationship with customer currently",
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

                        User.findByPk(customerid).then(customeruser => {
                            if (!customeruser) {
                              res.status(404).send({
                                statusCode: 404,
                                status: false,
                                message: "Customer Not Found",
                                data: []
                              });
                              return;
                            }
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Customer was found",
                                data: {
                                    accessToken: req.token,
                                    custmer_username: customeruser.username,
                                    custmer_firstname: customeruser.firstname,
                                    custmer_lastname: customeruser.lastname,
                                    custmer_phone: customeruser.phone,
                                    custmer_email: customeruser.email,
                                    custmer_address: customeruser.address,
                                    custmer_country: customeruser.country,
                                    custmer_image: customeruser.image,
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
                            message: "Wocman has no relationship with customer currently",
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
                    message: "Invali customerid",
                    data: []
                }
            );
        }
    }
};