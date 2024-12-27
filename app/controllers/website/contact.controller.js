const pathRoot = "../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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
      // Upload images to S3 using PutObjectCommand
      await Promise.all(
        files.map(async (item) => {
          const fileType = item.originalname.split(".").pop();
          const uniqueFileName = `${uuidv4()}.${fileType}`;

          const params = {
            Bucket: config.awsS3BucketName,
            Key: uniqueFileName,
            Body: item.buffer,
            ContentType: item.mimetype,
          };

          const command = new PutObjectCommand(params);
          const data = await s3.send(command);

          const fileUrl = `https://${config.awsS3BucketName}.s3.${s3.config.region}.amazonaws.com/${uniqueFileName}`;

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

