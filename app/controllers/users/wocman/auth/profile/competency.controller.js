const pathRoot = '../../../../../';
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const fs = require('fs');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");

const Op = db.Sequelize.Op;

exports.wocmanAddCompetence = (req, res, next) => {
    const competenceid = req.body.competenceid;

    if (typeof competenceid === "undefined") {
        return res.status(400).send({
            statusCode: 400,
            status: false,
            message: "competenceid field is undefined.",
            data: []
        });
    }

    const user_id = req.userId;
    if (!user_id) {
        return res.status(400).send({
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
                data: []
            });
        }

        Competency.findOne({ where: { 'id': competenceid } }).then(ds34drsd => {
            if (!ds34drsd) {
                return res.status(404).send({
                    statusCode: 400,
                    status: false,
                    message: "Competency does not exist",
                    data: []
                });
            }
            const comName = ds34drsd.name;

            // Remove all existing competencies for the user
            Wcompetency.destroy({ where: { 'userid': user_id } })
                .then(() => {
                    // Create new competency entry
                    Wcompetency.create({
                        userid: user_id,
                        competencyid: competenceid
                    }).then(() => {
                        // Create the file content (just an example)
                        const fileName = `competency_${user_id}_${competenceid}.txt`;
                        const fileContent = `User ${user_id} declared Competency: ${comName}`;

                        // Upload file to S3 using PutObjectCommand
                        const uploadParams = {
                            Bucket: config.awsS3BucketName,
                            Key: fileName,
                            Body: fileContent, // The content you want to upload
                            ContentType: 'text/plain', // Or the appropriate content type
                        };

                        const command = new PutObjectCommand(uploadParams);
                        s3.send(command)
                            .then(() => {
                                // Send notification after successful file upload
                                const pushUser = user_id;
                                const pushType = 'service';
                                const pushBody = `Dear ${users.username}, <br />You have declared your Wocman Competency as ${comName}. This would be reviewed soon.<br />A corresponding response would be sent to you.`;

                                Helpers.pushNotice(pushUser, pushBody, pushType);

                                // Send response to the client
                                res.status(200).send({
                                    statusCode: 200,
                                    status: true,
                                    message: "Competency was added and file uploaded",
                                    data: {
                                        accessToken: req.token
                                    }
                                });
                            })
                            .catch(err => {
                                res.status(500).send({
                                    statusCode: 500,
                                    status: false,
                                    message: "File upload failed: " + err.message,
                                    data: []
                                });
                            });
                    }).catch(err => {
                        res.status(500).send({
                            statusCode: 500,
                            status: false,
                            message: err.message,
                            data: []
                        });
                    });
                }).catch(err => {
                    res.status(500).send({
                        statusCode: 500,
                        status: false,
                        message: err.message,
                        data: []
                    });
                });
        }).catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: []
            });
        });
    }).catch(err => {
        res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: []
        });
    });
};

exports.wocmanListCompetencies = (req, res, next) => {
    const user_id = req.userId;
    if (!user_id) {
        return res.status(400).send({
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
                data: []
            });
        }
        Competency.findAll().then(ffdfdfcategry => {
            if (!ffdfdfcategry) {
                return res.status(404).send({
                    statusCode: 400,
                    status: false,
                    message: "Competency Not Found",
                    data: []
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
        }).catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: []
            });
        });
    }).catch(err => {
        res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: []
        });
    });
};
