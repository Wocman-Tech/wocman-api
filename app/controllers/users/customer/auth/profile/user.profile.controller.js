const ProfileServices = require('../../../../../service/customer/profile.service');

const profileController = async (req, res, next) => {
    try {
        const profile = await ProfileServices.getUserProfile(req.userId);
        const message = 'User profile fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: profile,
        });;
    } catch (error) {
        return res.status(500).send({
            statusCode: 500,
            status: false,
            message: error.message || 'Internal server error',
            data: []
        });
    }
};

const profileControllers = {
    profileController
};

module.exports = profileControllers;