const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const fs = require("fs");
const User = db.User;
const Cert = db.Cert;

const Helpers = require(pathRoot + "helpers/helper.js");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

exports.wocmanAddCertificate = async (req, res, next) => {
  const { name: cert_name, issued_date: cert_issue_date } = req.body;

  if (!cert_name) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Certificate name field is undefined.",
      data: [],
    });
  }
  if (!cert_issue_date) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Certificate date of issue field is undefined.",
      data: [],
    });
  }

  const file = req.file;

  if (!req.userId || req.userId === "") {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "User could not be verified",
      data: [],
    });
  }

  const user_id = req.userId;
  const fileParts = file.originalname.split(".");
  const fileType = fileParts[fileParts.length - 1];
  const uniqueFileName = `${uuidv4()}.${fileType}`;

  const s3 = new S3Client({
    region: "us-east-2",
    credentials: {
      accessKeyId: config.awsS3AccessKeyId,
      secretAccessKey: config.awsS3SecretAccessKey,
    },
    forcePathStyle: true,
    tls: true,
  });

  const uploadParams = {
    Bucket: config.awsS3BucketName,
    Key: uniqueFileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    // Use @aws-sdk/lib-storage Upload for efficient file uploads
    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    const response = await upload.done();
    const fileUrl = response.Location;

    // Validate data using Joi
    const joiSchema = Joi.object({
      cert_name: Joi.string().min(1).max(225).required(),
      cert_issue_date: Joi.string().min(1).max(225).required(),
    });

    const { error } = joiSchema.validate({ cert_name, cert_issue_date });
    if (error) {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: error.message,
        data: [],
      });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "User Not found.",
        data: [],
      });
    }

    const existingCert = await Cert.findOne({
      where: { name: cert_name, userid: user_id },
    });
    if (existingCert) {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "Certificate already exists for this user.",
        data: [],
      });
    }

    await Cert.create({
      userid: user_id,
      name: cert_name,
      issue_date: cert_issue_date,
      picture: fileUrl,
    });

    Helpers.pushNotice(
      user_id,
      `Dear ${user.username},<br/>You have added a certificate. <br/>This will be reviewed soon. A corresponding response will be sent to you.`,
      "service"
    );

    await User.update({ certificatesupdate: 1 }, { where: { id: user_id } });

    res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Certificate was added successfully.",
      data: {
        imageUrl: fileUrl,
        accessToken: req.token,
      },
    });
  } catch (err) {
    console.error("Error uploading certificate:", err);
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
