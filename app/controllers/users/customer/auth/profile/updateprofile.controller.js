const pathRoot = "../../../../../";
const db = require(pathRoot + "models");
const User = db.User;
const Helpers = require(pathRoot + "helpers/helper.js");
const Joi = require("joi");

exports.ProfileUpdate = async (req, res) => {
  if (!req.userId) {
    return res.status(400).json({
      statusCode: 400,
      status: false,
      message: "User was not found",
      data: [],
    });
  }

  const { firstname, lastname, address, country, state, username } = req.body;

  // Validate input using Joi
  const schema = Joi.object({
    firstname: Joi.string().min(3).max(225).required(),
    lastname: Joi.string().min(3).max(225).required(),
    address: Joi.string().min(10).max(225).required(),
    country: Joi.string().min(3).max(225).required(),
    state: Joi.string().min(3).max(225).required(),
    username: Joi.string().min(3).max(225).required(),
  });

  const { error } = schema.validate({
    firstname,
    lastname,
    address,
    country,
    state,
    username,
  });

  if (error) {
    return res.status(400).json({
      statusCode: 400,
      status: false,
      message: error.details[0].message,
      data: [],
    });
  }

  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User not found",
        data: [],
      });
    }

    await user.update({
      firstname,
      lastname,
      address,
      country,
      state,
      username,
    });

    const pushBody = `Dear ${username},<br />Your customer profile was updated.<br />If this wasn’t you, please contact admin immediately.<br />Thanks.`;

    Helpers.pushNotice(user.id, pushBody, "service");

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Profile Updated",
      data: {
        accessToken: req.token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: err.message,
      data: [],
    });
  }
};
