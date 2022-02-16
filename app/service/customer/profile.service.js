const { User } = require('../../models');

const getUserProfile = async (userId) => {
    const profile = await User.findOne({
        where: {
            id: userId
        },
        attributes: {
            exclude: ['verify_email', 'password', 'weblogintoken', 'password'],
          },
    });
    if (!profile) {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "User was not found",
                data: []
            });
    }
    return profile;
};

const profileServices = {
    getUserProfile
};

module.exports = profileServices;