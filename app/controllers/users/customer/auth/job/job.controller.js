const JobServices = require('../../../../../service/customer/job.service');

const jobController = async (req, res, next) => {
    try {
        const jobServices = await JobServices.jobCategory();
        const message = 'Job categories fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: jobServices,
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

const jobControllers = {
    jobController
};

module.exports = jobControllers;