const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const { S3Client } = require("@aws-sdk/client-s3");

// Create the S3 client instance
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
  forcePathStyle: true, // Optional, if you use path-style URLs
  tls: true, // Ensures SSL is enabled (same as sslEnabled: true in v2)
});
const User = db.User;
const Competency = db.Competency;
const Wcompetency = db.Wcompetency;


const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const Op = db.Sequelize.Op;

exports.wocmanAddCompetence = (req, res, next) => {
    var competenceid =  req.body.competenceid;

    if (typeof competenceid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "competenceid  field is undefined.",
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

    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: "User Not found.",
                data:[]
            });
        }

        Competency.findOne({
            where: {'id' : competenceid}
        }).then(ds34drsd => {
            if (!ds34drsd) {
            	return res.status(404).send({
	                statusCode: 400,
	                status: false,
	                message: "Competency does not exist",
	                data:[]
	            });
            }
            var comName  = ds34drsd.name;

            //remove all
            Wcompetency.destroy({
                where: {'userid': user_id}
            })
            //create one
            Wcompetency.create({
                userid: user_id,
                competencyid: competenceid
            })
            .then(hgh  => {

                const pushUser = user_id;
                const pushType = 'service';
                const pushBody = 'Dear ' + users.username + ", <br />You have Declared Your " +
                                " Wocman Competency as " + comName + ". <br /> This would be reviewed soon " +
                                "<br />A corresponding response would be sent to you<br/>";

                Helpers.pushNotice(pushUser, pushBody, pushType);

               
                res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Competency was added",
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

exports.wocmanListCompetencies = (req, res, next) => {
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
                statusCode: 400,
                status: false,
                message: "User Not found.",
                data:[]
            });
        }
        Competency.findAll({
        }).then(ffdfdfcategry => {
            if (!ffdfdfcategry) {
                return res.status(404).send({
                    statusCode: 400,
                    status: false,
                    message: "Competency Not Found",
                    data:[]
                });
            }
            res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Competency was found",
                data: {
                	Competencies: ffdfdfcategry,
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