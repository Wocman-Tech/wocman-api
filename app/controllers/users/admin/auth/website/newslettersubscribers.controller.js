const pathRoot = "../../../../../";
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
const Nletter = db.Nletter;
const { v4: uuidv4 } = require("uuid");

const Helpers = require(pathRoot + "helpers/helper.js");
const { verifySignUp } = require(pathRoot + "middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot + "helpers/helper.js");

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

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

exports.AllNewsletter = (req, res, next) => {
  Nletter.findAndCountAll()
    .then((result) => {
      res.status(200).send({
        statusCode: 200,
        status: true,
        message: "Found newsletters",
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

exports.oneNewsletter = (req, res, next) => {
  const id = req.params.id;
  Nletter.findByPk(id)
    .then((result) => {
      res.status(200).send({
        statusCode: 200,
        status: true,
        message: "Found newsletter",
        data: result,
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

exports.deleteNewsletter = (req, res, next) => {
  const ids = req.params.id;
  Nletter.destroy({
    where: { id: ids },
  })
    .then(() => {
      res.status(200).send({
        statusCode: 200,
        status: true,
        message: "Deleted newsletter",
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

exports.sendNewsletter = async (req, res, next) => {
  const { text, subject } = req.body;
  if (!text || !subject) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Text and subject are required.",
      data: [],
    });
  }

  const files = req.files;
  const tracker = uuidv4();

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

  // Send newsletter to subscribers
  try {
    const subscribers = await Nletter.findAll({});
    if (subscribers && subscribers.length > 0) {
      for (let i = 0; i < subscribers.length; i++) {
        const subscriber = subscribers[i];
        const subscriber_email = subscriber.email;

        const response = {
          body: {
            name: subscriber.name,
            intro: subscriber_email,
            action: {
              button: {},
            },
          },
        };

        const mail = MailGenerator.generate(response);
        const attachments = [];

        // Fetch images related to the tracker
        const images = await ImageStore.findAll({
          where: { tracker: tracker },
        });
        images.forEach((image) => {
          const image_path = image.image;
          const image_name = image_path.split("/").pop();

          attachments.push({
            filename: image_name,
            path: image_path,
          });
        });

        const message = {
          from: EMAIL,
          to: subscriber_email,
          subject: subject,
          html: mail,
          attachments: attachments,
        };

        await transporter.sendMail(message);
      }

      res.status(200).send({
        statusCode: 200,
        status: true,
        message: "Sent newsletters",
        data: [],
      });
    } else {
      res.status(403).send({
        statusCode: 403,
        status: false,
        message: "Could not find subscribers",
        data: [],
      });
    }
  } catch (err) {
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
