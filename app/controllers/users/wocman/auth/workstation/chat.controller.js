const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");
const fs = require("fs");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
});

const User = db.User;
const Projects = db.Projects;
const WCChat = db.WcChat;
const Helpers = require(pathRoot + "helpers/helper.js");
const { v4: uuidv4 } = require("uuid");
const Op = db.Sequelize.Op;

exports.chatSave = async (req, res, next) => {
  const { customerid, message, messageType, projectid } = req.body;
  const seen = 0;

  if (!customerid || !message || !messageType || !projectid) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: "Required fields are missing",
      data: [],
    });
  }

  const joiSchema = Joi.object().keys({
    customerid: Joi.string().min(1),
    message: Joi.string().min(1).max(225),
    projectid: Joi.string().min(1).max(225),
  });
  const { error } = joiSchema.validate({ customerid, projectid, message });
  if (error) {
    return res.status(400).send({
      statusCode: 400,
      status: false,
      message: error.message,
      data: [],
    });
  }

  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "User Not Found",
        data: [],
      });
    }

    const project = await Projects.findOne({
      where: { wocmanid: req.userId, customerid, projectid },
    });
    if (!project) {
      return res.status(404).send({
        statusCode: 404,
        status: false,
        message: "Project Not Found",
        data: [],
      });
    }

    const chatTracker = uuidv4();
    const chat = await WCChat.create({
      senderid: parseInt(req.userId, 10),
      receiverid: parseInt(customerid, 10),
      message,
      messagetype: messageType,
      messagelinks: "",
      seen,
      tracker: chatTracker,
      projectid: parseInt(projectid, 10),
    });

    if (messageType === "media" && req.files) {
      const images = [];
      for (const file of req.files) {
        const fileType = file.originalname.split(".").pop();
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

         const response =  await upload.done();

          const fileUrl = response.Location;
          images.push(fileUrl);
        } catch (err) {
          console.error("S3 Upload Error:", err);
        }
      }

      const allImageUrls = images.join(Helpers.padTogether());
      await WCChat.update(
        { messagelinks: allImageUrls },
        { where: { tracker: chatTracker } }
      );
    }

    res.send({
      statusCode: 200,
      status: true,
      message: "Message Sent",
      data: { accessToken: req.token },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
