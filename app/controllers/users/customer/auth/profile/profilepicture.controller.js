const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const fs = require("fs");
const User = db.User;
const Helpers = require(pathRoot + "helpers/helper.js");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");
const { v4: uuidv4 } = require("uuid");

// Create the S3 client instance
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
  forcePathStyle: true, // Optional, if you use path-style URLs
  tls: true, // Ensures SSL is enabled
});

exports.uploadProfilePicture = async (req, res, next) => {
  if (!req.userId || req.userId === "") {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "User could not be verified",
      data: [],
    });
  }

  const userId = req.userId;
  const file = req.file; // This is the file from the request

  if (!file) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "avatar field was undefined",
      data: [],
    });
  }

  const fileParts = file.originalname.split(".");
  const fileType = fileParts[fileParts.length - 1];
  const uniqueFileName = `${uuidv4()}.${fileType}`;

  const uploadParams = {
    Bucket: config.awsS3BucketName, // Your S3 bucket name
    Key: uniqueFileName, // Unique file key
    Body: file.buffer, // File content
    ContentType: file.mimetype, // Ensure correct content type
  };

  try {
    // Use @aws-sdk/lib-storage's Upload class for efficient upload
    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    const response = await upload.done();

    const fileUrl = response.Location;

    if (!fileUrl) {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "Upload Not successful",
        data: [],
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "User Not found.",
        data: [],
      });
    }

    await user.update({
      image: fileUrl,
      images: user.images + Helpers.padTogether() + fileUrl,
    });

    res.send({
      statusCode: 201,
      status: true,
      message: "Profile picture uploaded successfully",
      data: {
        imageUrl: fileUrl,
        accessToken: req.token,
      },
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
