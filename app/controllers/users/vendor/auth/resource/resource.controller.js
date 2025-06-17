const db = require("../../../../../models");

const Resources = db.Resources;
const ResourceType = db.ResourceType;
const ResourceSubType = db.ResourceSubType;

exports.getVendorResources = async (req, res) => {
  const vendorId = req.userId;

  if (!vendorId) {
    return res.status(400).json({
      statusCode: 400,
      status: false,
      message: "Vendor ID not found in request",
      data: [],
    });
  }

  try {
    const resources = await Resources.findAll({
      where: { vendorId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Resources fetched successfully",
      data: resources,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "An error occurred while fetching resources",
      data: [],
    });
  }
};

exports.getResourcesByType = async (req, res) => {
  try {
    const {
      type, // 'Materials' or 'Equipment'
      status,
      subTypeId,
      limit = 10,
      offset = 0,
    } = req.query;

    if (!type) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message:
          "Missing required query parameter: type (e.g., 'Materials' or 'Equipment')",
        data: [],
      });
    }

    // Find the resource type ID
    const resourceType = await ResourceType.findOne({ where: { name: type } });

    if (!resourceType) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: `Resource type '${type}' not found`,
        data: [],
      });
    }

    // Build query filters
    const where = {
      resourceid: resourceType.id,
    };

    if (status) where.status = status;
    if (subTypeId) where.subtypeid = subTypeId;

    const result = await Resources.findAndCountAll({
      where,
      include: [
        {
          model: ResourceType,
          attributes: ["id", "name"],
          as: "resource_type",
        },
        {
          model: ResourceSubType,
          attributes: ["id", "name"],
          as: "sub_category",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: `${type} resources fetched successfully`,
      data: {
        total: result.count,
        items: result.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "An error occurred while fetching resources",
      data: [],
    });
  }
};
