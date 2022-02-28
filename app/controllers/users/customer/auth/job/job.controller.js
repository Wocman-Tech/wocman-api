const JobServices = require('../../../../../service/customer/job.service');

const jobCategory = async (req, res, next) => {
    try {
        const jobServices = await JobServices.jobCategory();
        const message = 'Job categories fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: jobServices,
        });
    } catch (error) {
        return res.status(500).send({
            statusCode: 500,
            status: false,
            message: error.message || 'Internal server error',
            data: []
        });
    }
};

const customerJobs = async (req, res, next) => {
    try {
        const jobs = await JobServices.getCustomerJobs(req.userId);
        const message = 'Customer jobs fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: jobs,
        });
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
    jobCategory,
    customerJobs
};

module.exports = jobControllers;