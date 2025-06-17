const Joi = require("joi");
const db = require("../../../../../models");
const Helpers = require("../../../../../helpers/helper");

const User = db.User;

exports.ProfileUpdate = async (req, res) => {
  if (!req.userId) {
    return res.status(400).json({
      statusCode: 400,
      status: false,
      message: "User was not found",
      data: [],
    });
  }

  const schema = Joi.object({
    firstname: Joi.string().min(3).max(225).required().label("Firstname"),
    lastname: Joi.string().min(3).max(225).required().label("Lastname"),
    // address: Joi.string().min(10).max(225).required().label("Address"),
    country: Joi.string().min(3).max(225).required().label("Country"),
    state: Joi.string().min(3).max(225).required().label("State"),
    username: Joi.string().min(3).max(225).required().label("Username"),
  });

  const { firstname, lastname, country, state, username } = req.body;

  const { error } = schema.validate({
    firstname,
    lastname,
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
        message: "User not found.",
        data: [],
      });
    }

    await user.update({
      firstname,
      lastname,
      country,
      state,
      username,
    });

    const pushBody = `
      Dear ${user.username},<br />
      Your Vendor profile was updated.<br />
      If this wasn't you, please report to the admin for rectification.<br/>
      Thanks
    `;

    Helpers.pushNotice(user.id, pushBody, "service");

    return res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Profile updated successfully.",
      data: {
        accessToken: req.token,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "An error occurred while updating profile.",
      data: [],
    });
  }
};
