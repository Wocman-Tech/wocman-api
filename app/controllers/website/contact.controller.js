const pathRoot = "../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");

const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

// Create the S3 client instance
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
});

const ImageStore = db.ImageStore;
const Contactus = db.Contactus;
const { v4: uuidv4 } = require("uuid");

exports.contactus = async (req, res, next) => {
  const { email, name, phone, inquiry, message } = req.body;
  const tracker = uuidv4();

  // Validate inputs
  if (!email || !name || !phone || !inquiry || !message) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "All fields are required.",
      data: [],
    });
  }

  const files = req.files;

  if (files && files.length > 0) {
    try {
      await Promise.all(
        files.map(async (item) => {
          let myFile = file.originalname.split(".");
          const fileType = myFile[myFile.length - 1];
          const dsf = uuidv4();

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

          const fileUrl = response.Location;

          // Save image info in the database
          await ImageStore.create({
            image: fileUrl,
            tracker: tracker,
          });
        })
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).send({
        statusCode: 500,
        status: false,
        message: "Error uploading files",
        data: [],
      });
    }
  }

  // Create the contact us entry
  try {
    await Contactus.create({
      name,
      email,
      phone,
      enquiry: inquiry,
      message,
      tracker,
    });

    res.status(200).send({
      statusCode: 200,
      status: true,
      message: "Successful message",
      data: [],
    });
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
