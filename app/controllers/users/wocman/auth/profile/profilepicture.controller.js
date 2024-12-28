const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { v4: uuidv4 } = require("uuid");

const User = db.User;
const Helpers = require(pathRoot + "helpers/helper.js");

// Create the S3 client instance
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
});

exports.uploadProfilePictureWocman = async (req, res, next) => {
  if (!req.userId) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "User could not be verified",
      data: [],
    });
  }

  const file = req.file; // This is the file uploaded by the user
  if (!file) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Avatar file was undefined",
      data: [],
    });
  }

  const userId = req.userId;
  const myFile = file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  const fileKey = `${uuidv4()}.${fileType}`;

  try {
    // Prepare upload parameters
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: config.awsS3BucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    // Start the upload process
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
      statusCode: 200,
      status: true,
      message: "Profile picture uploaded successfully",
      data: {
        imageUrl: fileUrl,
        accessToken: req.token,
      },
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: error.message,
      data: [],
    });
  }
};
