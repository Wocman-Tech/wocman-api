const pathRoot = "../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const fs = require("fs");

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
const ImageStore = db.ImageStore;

const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Nletter = db.Nletter;
const Contactus = db.Contactus;

const Projects = db.Projects;
const Project = db.Projecttype;
const Wshear = db.Wshear;
const WAChat = db.WaChat;
const WCChat = db.WcChat;
const WWallet = db.WWallet;

const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");

const { v4: uuidv4 } = require("uuid");

const Op = db.Sequelize.Op;

exports.contactus = (req, res, next) => {
  var emailAddress = req.body.email;
  var name = req.body.name;
  var phone = req.body.phone;
  var inquiry = req.body.inquiry;
  var message = req.body.message;
  const tracker = uuidv4();

  if (typeof emailAddress === "undefined") {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "email is undefined.",
      data: [],
    });
  } else {
    if (typeof name === "undefined") {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "name is undefined.",
        data: [],
      });
    } else {
      if (typeof phone === "undefined") {
        return res.status(400).send({
          statusCode: 400,
          status: false,
          message: "phone is undefined.",
          data: [],
        });
      } else {
        if (typeof inquiry === "undefined") {
          return res.status(400).send({
            statusCode: 400,
            status: false,
            message: "inquiry is undefined.",
            data: [],
          });
        } else {
          if (typeof message === "undefined") {
            return res.status(400).send({
              statusCode: 400,
              status: false,
              message: "message is undefined.",
              data: [],
            });
          } else {
            const file = req.files;
            const tracker = uuidv4();
            if (typeof file === "undefined") {
            } else {
              file.map((item) => {
                let myFile = item.originalname.split(".");
                const fileType = myFile[myFile.length - 1];

                var params = {
                  ACL: "public-read-write",
                  Bucket: config.awsS3BucketName,
                  Key: item.originalname,
                  Body: item.buffer,
                };

                s3.upload(params, (error, data, res) => {
                  if (error) {
                    // res.status(500).send(error)
                    console.log(error);
                  } else {
                    var fileUrl = data.Location;
                    if (typeof fileUrl === "undefined") {
                      //empty file
                    } else {
                      ImageStore.create({
                        image: fileUrl,
                        tracker: tracker,
                      });
                    }
                  }
                });
              });
            }

            Contactus.create({
              name: name,
              email: emailAddress,
              phone: phone,
              enquiry: inquiry,
              message: message,
              tracker: tracker,
            })
              .then((hgh) => {
                res.status(200).send({
                  statusCode: 200,
                  status: true,
                  message: "Successful message",
                  data: [],
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
          }
        }
      }
    }
  }
};
