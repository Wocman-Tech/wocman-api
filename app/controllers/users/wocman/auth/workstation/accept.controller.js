const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const Projects = db.Projects;

const Helpers = require(pathRoot+"helpers/helper.js");

exports.wocmanAcceptProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
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
                }
                Projects.findByPk(projectid).then(project => {
                    if (!project) {
                      res.status(404).send({
                            statusCode: 404,
                            status: false,
                            message: "Project Not Found",
                            data: []
                      });
                    }
                    if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                        res.status(404).send({
                             statusCode: 404,
                            status: false,
                            message: "Project Owner not resolved",
                            data: []
                          });
                          return;
                    }else{
                        project.update({
                            wocmanaccept:2
                        }).then(() => {
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Project Accepted",
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
