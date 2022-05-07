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

exports.book_appointment = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    var appointmentDate =  req.body.date;
    
   
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "project  is undefined.",
                data: []
            }
        );
    }else{

        //schema
        const joiClean = Joi.object().keys({ 
            projectid: Joi.number().integer().min(1), 
        }); 
        const dataToValidate = { 
          projectid: projectid 
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
                Projects.findByPk(projectid).then(project => {
                    if (!project) {
                        res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "Project Not Found",
                            data: []
                        });
                        return;
                    }
                    if (parseInt(project.customerid, 10) !== parseInt(req.userId, 10)) {
                        res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "Project Owner not resolved",
                            data: []
                        });
                        return;
                    }else{
                        Projects.update(
                        {
                            datetimeset:appointmentDate
                        },
                        {
                            where: {'projectid': projectid}
                        }
                        ).then(() => {
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Appointment  Set",
                                data: {
                                    accessToken: req.token
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
                    message: "Invali Projectid",
                    data: []
                }
            );
        }
    }
};