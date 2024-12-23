const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"); // Import PutObjectCommand

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
const Cert = db.Cert;

const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");

const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const Op = db.Sequelize.Op;

exports.wocmanAddCertificate = (req, res, next) => {
  var cert_name = req.body.name;
  var cert_issue_date = req.body.issued_date;

  if (typeof cert_name === "undefined") {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Certificate name field is undefined.",
      data: [],
    });
  }
  if (typeof cert_issue_date === "undefined") {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Certificate date of issue field is undefined.",
      data: [],
    });
  }

  const file = req.file; // This is the file name

  if (req.userId && req.userId !== "") {
    var user_id = req.userId;
  } else {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "User could not be verified",
      data: [],
    });
  }

  // File type handling
  let myFile = file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  const dsf = uuidv4();

  const params = {
    ACL: "public-read-write",
    Bucket: config.awsS3BucketName,
    Key: `${dsf}.${fileType}`,
    Body: file.buffer,
  };

  // Use PutObjectCommand to upload file
  const putObjectCommand = new PutObjectCommand(params);

  s3.send(putObjectCommand)
    .then((data) => {
      const fileUrl = data.Location;
      if (typeof fileUrl === "undefined") {
        return res.status(400).send({
          statusCode: 400,
          status: false,
          message: "Upload Not successful",
          data: [],
        });
      }

      // Schema Validation
      const joiCleanSchema = Joi.object().keys({
        cert_name: Joi.string().min(1).max(225).required(),
        cert_issue_date: Joi.string().min(1).max(225).required(),
      });
      const dataToValidate = {
        cert_name: cert_name,
        cert_issue_date: cert_issue_date,
      };
      const joyResult = joiCleanSchema.validate(dataToValidate);
      if (joyResult.error != null) {
        return res.status(404).send({
          statusCode: 400,
          status: false,
          message: joyResult.error,
          data: [],
        });
      }

      // Check if user exists
      User.findByPk(user_id)
        .then((users) => {
          if (!users) {
            return res.status(404).send({
              statusCode: 400,
              status: false,
              message: "User Not found.",
              data: [],
            });
          }

          // Check if certificate already exists for user
          Cert.findOne({
            where: { name: cert_name, userid: user_id },
          })
            .then((ds34dsd) => {
              if (ds34dsd) {
                return res.status(404).send({
                  statusCode: 400,
                  status: false,
                  message: "Certificate Already exists for such user",
                  data: [],
                });
              }

              // Create certificate record
              Cert.create({
                userid: user_id,
                name: cert_name,
                issue_date: cert_issue_date,
                picture: fileUrl,
              })
                .then((hgh) => {
                  const pushUser = user_id;
                  const pushType = "service";
                  const pushBody =
                    "Dear " +
                    users.username +
                    ", <br />You have added " +
                    "a certificate. <br /> This would be reviewed soon " +
                    "<br />A corresponding response would be sent to you<br/>";

                  Helpers.pushNotice(pushUser, pushBody, pushType);

                  User.update(
                    { certificatesupdate: 1 },
                    { where: { id: user_id } }
                  );
                  res.status(200).send({
                    statusCode: 200,
                    status: true,
                    message: "Certificate was added",
                    data: {
                      imageUrl: fileUrl,
                      accessToken: req.token,
                    },
                  });
                })
                .catch((err) => {
                  res.status(500).send({
                    statusCode: 500,
                    status: false,
                    message: err.message,
                    data: [],
                  });
                });
            })
            .catch((err) => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
        })
        .catch((err) => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    })
    .catch((error) => {
      res.status(500).send({
        statusCode: 500,
        status: false,
        message: error.message,
        data: [],
      });
    });
};

