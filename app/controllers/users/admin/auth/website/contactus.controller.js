const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const fs = require("fs");

const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

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

exports.replayContact = async (req, res, next) => {
  const text = req.body.text;
  const subject = req.body.subject;
  const contactid = req.body.contactid;

  if (!text) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Include text field",
      data: [],
    });
  }

  if (!subject) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Include the subject field",
      data: [],
    });
  }

  if (!contactid) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Include the contactid field",
      data: [],
    });
  }

  try {
    const result = await Contactus.findOne({ where: { id: contactid } });

    if (!result) {
      return res.status(403).send({
        statusCode: 403,
        status: false,
        message: "Could not find chat",
        data: [],
      });
    }

    const tracker = uuidv4();
    const files = req.files || [];

    // Upload files to S3
    for (const file of files) {
      const myFile = file.originalname.split(".");
      const fileType = myFile[myFile.length - 1];
      const uniqueFileName = `${uuidv4()}.${fileType}`;

      const uploadParams = {
        Bucket: config.awsS3BucketName,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const upload = new Upload({
          client: s3,
          params: uploadParams,
        });

        const response = await upload.done();
        const fileUrl = response.Location;
        await ImageStore.create({
          image: fileUrl,
          tracker: tracker,
        });
      } catch (err) {
        console.error("Error uploading file to S3:", err);
      }
    }

    const subscriber = result.name;
    const subscriberEmail = result.email;
    const emailTracker = result.tracker;

    const responseBody = {
      body: {
        name: subscriber,
        intro: subscriberEmail,
        action: { button: {} },
      },
    };

    const mail = MailGenerator.generate(responseBody);
    const attachments = [];

    const images = await ImageStore.findAll({ where: { tracker: tracker } });
    images.forEach((image) => {
      const imagePath = image.image;
      const imageName = imagePath.split("/").pop();
      attachments.push({
        filename: imageName,
        path: imagePath,
      });
    });

    const message = {
      from: EMAIL,
      to: subscriberEmail,
      subject: `${emailTracker}: ${subject}`,
      html: mail,
      attachments: attachments,
    };

    await transporter.sendMail(message);

    res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Sent Reply",
      data: [],
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
