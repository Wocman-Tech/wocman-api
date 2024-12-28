const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const { v4: uuidv4 } = require("uuid");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

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

exports.uploadProfilePicture = async (req, res) => {
  // Verify user ID
  if (!req.userId) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "User could not be verified",
      data: [],
    });
  }
  const user_id = req.userId;

  // Check for file
  const file = req.file;
  if (!file) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "avatar field was undefined",
      data: [],
    });
  }

  // Generate unique file name
  let myFile = file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  const dsf = uuidv4();

  try {
    const params = {
      Bucket: config.awsS3BucketName, // Your S3 bucket name
      Key: `${dsf}.${fileType}`, // Unique file key
      Body: file.buffer, // File content
      ContentType: file.mimetype, // Ensure correct content type
    };

    const upload = new Upload({
      client: s3,
      params: params,
    });

    const response = await upload.done();

    // Construct the file URL (if necessary)
    const fileUrl = response.Location;

    // Update user record
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "User not found.",
        data: [],
      });
    }

    // Check if the user is allowed to upload profile picture (if admin)
    if (req.isprofile == 0) {
      return res.status(403).send({
        statusCode: 403,
        status: false,
        message: "Unauthorized admin",
        data: [],
      });
    }

    await user.update({
      image: fileUrl,
      images: user.images + Helpers.padTogether() + fileUrl,
    });

    // Send success response
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
    console.error("Error uploading profile picture:", error);
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: error.message,
      data: [],
    });
  }
};
