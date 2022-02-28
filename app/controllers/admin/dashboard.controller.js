const DashboardServices = require('../../service/admin/dashboard.service');
const { approveStatusValidation, getProjectsValidation } = require('../../validation/project.validation');

const getProjects = async (req, res, next) => {
    try {
        if (!req.query.limit) req.query.limit = 10;
        if (!req.query.page) req.query.page = 1;

        const { error } = await getProjectsValidation(req.query);
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        }

        const jobs = await DashboardServices.getProjects(req.query);
        const message = 'Projects fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: jobs,
        });
    } catch (error) {
        logger.error('dashboardControllers::getProjects', error);
        next(error);
    }
};

const approveProject = async (req, res, next) => {
    try {
        await DashboardServices.approveJob(req.params, req.query);

        const { error } = await approveStatusValidation(req.query);
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        };

        const message = 'Project approved successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: {},
        });
    } catch (error) {
        logger.error('dashboardControllers::approveProjects', error);
        next(error);
    }
};

const dashboardControllers = {
    getProjects,
    approveProject
};

module.exports = dashboardControllers;
