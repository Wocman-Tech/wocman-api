const JobServices = require('../../../../../service/wocman/jobs.service');
const { paginationValidation } = require('../../../../../validation');
const { approveStatusValidation, getProjectsValidation } = require('../../../../../validation/project.validation');

const acceptJob = async (req, res, next) => {
    try {
        const { error } = await approveStatusValidation(req.query, 'in-progress');
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        };
            
        await JobServices.acceptJob(req.params, req.query, req.userId);

        const message = 'Job accepted successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: {},
        });
    } catch (error) {
        logger.error('Controller::Wocman::Auth::jobControllers::acceptJob', error);
        next(error);
    }
};

const completeJob = async (req, res, next) => {
    try {
        const { error } = await approveStatusValidation(req.query, 'completed');
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        };
            
        await JobServices.completeJob(req.params, req.query, req.userId);

        const message = 'Job completed successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: {},
        });
    } catch (error) {
        logger.error('Controller::Wocman::Auth::jobControllers::completeJob', error);
        next(error);
    }
};

const getApprovedProjects = async (req, res, next) => {
    try {
        if (!req.query.limit) req.query.limit = 10;
        if (!req.query.page) req.query.page = 1;

        const { error } = await paginationValidation(req.query);
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        }

        const jobs = await JobServices.getApprovedJobs(req.query, req.userId);
        const message = 'Projects fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: jobs,
        });
    } catch (error) {
        logger.error('Controller::Wocman::Auth::jobControllers::getProjects', error);
        next(error);
    }
};

const jobControllers = {
    acceptJob,
    getApprovedProjects,
    completeJob
};

module.exports = jobControllers;