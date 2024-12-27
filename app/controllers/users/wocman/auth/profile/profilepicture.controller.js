const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
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
const fs = require("fs");
const User = db.User;

const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");

const { v4: uuidv4 } = require("uuid");

const Op = db.Sequelize.Op;

exports.uploadProfilePictureWocman = (req, res, next) => {
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
  const file = req.file; //this is the file name
  if (!file) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "avatar filed was undefined",
      data: [],
    });
  }
  // console.log(file);
  let myFile = file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  const dsf = uuidv4();

  const params = {
    Bucket: config.awsS3BucketName,
    Key: `${dsf}.${fileType}`,
    Body: file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }

    var fileUrl = data.Location;
    if (typeof fileUrl === "undefined") {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "Upload Not successful",
        data: [],
      });
    }

    User.findByPk(user_id)
      .then((users) => {
        if (!users) {
          return res.status(404).send({
            statusCode: 404,
            status: false,
            message: "User Not found.",
            date: [],
          });
        }
        users
          .update({
            image: fileUrl,
            images: users.images + Helpers.padTogether() + fileUrl,
          })
          .then(() => {
            res.send({
              statusCode: 200,
              status: true,
              message: "Profile picture uploaded successfully",
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
  });
};
