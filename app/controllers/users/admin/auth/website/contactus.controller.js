const pathRoot = "../../../../../";
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
const Contactus = db.Contactus;

const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");

const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
let nodeGeocoder = require("node-geocoder");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

let options = {
  provider: "openstreetmap",
};

let transporter = nodemailer.createTransport({
  host: config.message_server,
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: config.name,
    link: config.website,
  },
});

exports.allContacts = (req, res, next) => {
  Contactus.findAndCountAll()
    .then((result) => {
      res.status(200).send({
        statusCode: 200,
        status: true,
        message: "Found Contact us messages",
        data: result.rows,
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
};

exports.oneContact = (req, res, next) => {
  var id = req.params.id;
  Contactus.findByPk(id)
    .then((result) => {
      ImageStore.findAll({
        where: { tracker: result.tracker },
      })
        .then((images) => {
          res.status(200).send({
            statusCode: 200,
            status: true,
            message: "Found Contact us messages",
            data: result,
            images: images,
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
};

exports.deleteContact = (req, res, next) => {
  var ids = req.params.id;
  Contactus.destroy({
    where: { id: ids },
  })
    .then((result) => {
      res.status(200).send({
        statusCode: 200,
        status: true,
        message: "Deleted Contact Us Message",
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
};

exports.replayContact = (req, res, next) => {
  var text = req.body.text;
  var subject = req.body.subject;
  var contactid = req.body.contactid;

  if (text && text !== "") {
  } else {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Include text field",
      data: [],
    });
  }

  if (subject && subject !== "") {
  } else {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Include the subject field",
      data: [],
    });
  }

  if (contactid && contactid !== "") {
  } else {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Include the contactid field",
      data: [],
    });
  }

  Contactus.findOne({
    where: { id: contactid },
  })
    .then((result) => {
      if (result) {
        const file = req.files;
        const tracker = uuidv4();
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

        let subscriber = result.name;
        let subscriber_email = result.email;
        let email_tracker = result.tracker;
        let response = {
          body: {
            name: subscriber,
            intro: subscriber_email,
            action: {
              button: {},
            },
          },
        };

        let mail = MailGenerator.generate(response);

        var attachments = [];
        ImageStore.findAll({
          where: { tracker: tracker },
        }).then((images) => {
          for (var i = 0; i < images.length; i++) {
            let image_path = images[i].image;
            var hh8 = image_path.split("/");
            var hh9 = hh8.length();
            var image_name = hh8[hh9 - 1];
            var addto_attachments = {
              filename: image_name,
              path: image_path,
            };
            attachments.push({ addto_attachments });
          }

          let message = {
            from: EMAIL,
            to: subscriber_email,
            subject: email_tracker + ":" + subject,
            html: mail,
            attachments: attachments,
          };
          var sentMail = false;
          transporter.sendMail(message).then(() => {});
        });

        res.status(200).send({
          statusCode: 200,
          status: true,
          message: "Sent Reply",
          data: [],
        });
      } else {
        return res.status(403).send({
          statusCode: 403,
          status: false,
          message: "Could not find chat",
          data: [],
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        statusCode: 500,
        status: false,
        message: err.message,
        data: [],
      });
    });
};
