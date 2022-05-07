const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');

const User = db.User;
const Projects = db.Projects;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const Op = db.Sequelize.Op;


exports.workDone = (req, res, next) => {
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
        var unboard = Helpers.returnBoolean(users.unboard);

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
            var workDone = 0;
            if (!projects) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Wocman Project Not Found",
                    data: {
                        accessToken: req.token,
                        nnboard: unboard
                    }
                });
            }else{
                for (let i = 0; i < projects.length; i++) {
                    if (parseInt(projects[i].wocmanaccept, 10) == 5) {
                        workDone = workDone + 1;
                    }
                }
            }
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Found a wocman user",
                data: {
                    workDone: workDone,
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
    
};