const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const Projects = db.Projects;


const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");


exports.completedProjects = (req, res, next) => {
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
            if(req.userId && req.userId !== ''){
                Searchuserid = {'userid': req.userId};
                Searchwocmanid = {'wocmanid': req.userId};
            }else{
                Searchuserid = {'userid': {$not: null}};
                Searchwocmanid = {'wocmanid': {$not: null}};
            }
            Projects.findAll({
                where: Searchwocmanid
            })
            .then(projects => {
                var unboard = Helpers.returnBoolean(users.unboard);
                var  acceptedProjects = 0;
                var  allProjects = 0;
                if (!projects) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Wocman Project Not Found",
                        data: {
                            accessToken: req.token,
                            unboard: unboard
                        }
                    });
                }else{

                    for (let i = 0; i < projects.length; i++) {
                        allProjects = allProjects + 1;
                        if (parseInt(projects[i].wocmanaccept, 10) == 5) {
                            acceptedProjects = acceptedProjects + 1;
                        }
                    }  
                }
                var percentageCompletion = (acceptedProjects/allProjects)*100;

                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Found a wocman user",
                    data: {
                        completion: percentageCompletion,
                        accessToken: req.token,
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