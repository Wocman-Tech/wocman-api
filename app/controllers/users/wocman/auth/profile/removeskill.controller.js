const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const Wskills = db.Wskills;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const {v4 : uuidv4} = require('uuid');
const Joi = require('joi'); 

const Op = db.Sequelize.Op;

exports.wocmanRemoveSkill = (req, res, next) => {
    var skill_id =  req.body.skill_id;

    if (typeof skill_id === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "skill_id  field is undefined." ,
                data: []
            }
        );
    }
    if(req.userId && req.userId !== ''){
        var user_id = req.userId;
    }else{
        return res.status(400).send(
        {
            statusCode: 400,
            status: false,
            message: "User could not be verified",
            data: []
        });
    }

    //schema
    const joiCleanSchema = Joi.object().keys({ 
        skill_id: Joi.number().integer().min(1).max(225).required(),
    }); 
    const dataToValidate = {
      skill_id: skill_id
    }
    const joyResult = joiCleanSchema.validate(dataToValidate);
    if (joyResult.error == null) {
    }else{
        return res.status(404).send({
            statusCode: 400,
            status: false,
            message: joyResult.error,
            data: []
        });
    }

    
    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                data: []
            });
        }
        Wskills.findByPk(skill_id).then(ds34dsd => {
            if (!ds34dsd) {
                return res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Skill Not Found",
                    data: []
                });
            }else{
                if (ds34dsd.userid == user_id) {
                    //delete certificate
                    Wskills.destroy({
                        where: {'id': skill_id}
                    })
                    .then(deleteSkill => {
                        Wskills.findAll(
                            {where: {'userid': user_id}}
                        ).then(g5fdfd => {
                            if (!g5fdfd) {
                                User.update(
                                    {isSkilled: 0},
                                    {where: {id: users.id} }
                                );
                            }

                            const pushUser = users.id;
                            const pushType = 'service';
                            const pushBody = 'Dear ' + users.username + ", <br />You have removed a skill. " +
                                            "<br /> This would cause a review of your data " +
                                            "<br/> We would notify you when we are done";

                            Helpers.pushNotice(pushUser, pushBody, pushType);
                        
                            res.status(200).send({
                                statusCode: 200,
                                status: true,
                                message: "Skill was removed",
                                data: {
                                    accessToken:req.token
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
                    .catch(err => {  res.status(500).send({message: err.message }); });
                }else{
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Skill ownership Not resolved",
                        data: []
                    });
                }
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
};