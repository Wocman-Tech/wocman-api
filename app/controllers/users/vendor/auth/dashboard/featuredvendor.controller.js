const db = require("../../../../../models");
const config = require("../../../../../config/auth.config");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
});

const Resources = db.Resources;
const ResourceType = db.ResourceType;
const ResourceSubType = db.ResourceSubType;

exports.uploadResource = async (req, res) => {
  try {
    let imageUrls = [];

    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const myFile = file.originalname.split(".");
        const fileType = myFile[myFile.length - 1];
        const uniqueFileName = `${Date.now()}.${fileType}`;

        const params = {
          Bucket: config.awsS3BucketName,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const upload = new Upload({
          client: s3,
          params: params,
        });

        const response = await upload.done();
        const fileUrl = response.Location;

        imageUrls.push(fileUrl);
      }
    }

    const {
      description,
      resource,
      city,
      state,
      country,
      amount,
      resourceid,
      subtypeid,
    } = req.body;

    const newResource = await Resources.create({
      resource,
      description,
      city,
      state,
      country,
      amount,
      resourceid,
      subtypeid,
      vendorid: req.userId,
      images: imageUrls.join(", "),
    });

    return res.status(201).json({
      status: true,
      message: "Resource uploaded successfully",
      data: newResource,
    });
  } catch (error) {
    console.error("Error in uploadResource:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getResourceTypes = async (req, res) => {
  try {
    const types = await ResourceType.findAll();
    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Resource types retrieved successfully",
      data: types,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: error.message,
      data: [],
    });
  }
};

exports.getResourceSubtypes = async (req, res) => {
  try {
    const subtypes = await ResourceSubType.findAll({
      include: [
        {
          model: ResourceType,
          attributes: ["id", "name"],
          as: "parent_type",
        },
      ],
      order: [["name", "ASC"]],
    });

    const labeled = {
      Materials: [],
      Equipment: [],
    };

    subtypes.forEach((subtype) => {
      const typeName = subtype.parent_type?.name;
      if (typeName === "Materials") {
        labeled.Materials.push({
          id: subtype.id,
          name: subtype.name,
          typeId: subtype.resource_type_id,
        });
      } else if (typeName === "Equipment") {
        labeled.Equipment.push({
          id: subtype.id,
          name: subtype.name,
          typeId: subtype.resource_type_id,
        });
      }
    });

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Resource subtypes retrieved successfully",
      data: labeled,
    });
  } catch (error) {
    console.error("Error fetching resource subtypes:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: error.message || "Failed to retrieve resource subtypes",
      data: [],
    });
  }
};
