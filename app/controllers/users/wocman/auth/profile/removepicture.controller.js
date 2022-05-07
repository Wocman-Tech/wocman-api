const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;

const Op = db.Sequelize.Op;

exports.removeProfilePicture = (req, res, next) => {
    
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

    
    
    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                data: []
            });
        }
        if (users.image == null) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "No image Found",
                data: []
            });
        }
        User.update(
            {image: null}, 
            {where: {id: user_id}}
        )            
        res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Image was removed",
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
};