const DashboardServices = require('../../service/admin/dashboard.service');
const { approveStatusValidation, getProjectsValidation } = require('../../validation/project.validation');
const validator = require('../../validation/project.validation')

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
        logger.error('Controller::Admin::dashboardControllers::getProjects', error);
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
        logger.error('Controller::Admin::dashboardControllers::approveProjects', error);
        next(error);
    }
};

const getProjectMetrics = async (req, res, next) => {
    try {
        const [metrics] = await DashboardServices.getProjectStatusCount();

        const message = 'Project metrics fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: metrics,
        });
    } catch (error) {
        logger.error('Controller::Admin::dashboardControllers::approveProjects', error);
        next(error);
    }
};

const getSingleProject = async (req, res, next) => {
    try {
        const jobs = await DashboardServices.getSingleProject(req.params);
        const message = 'Project fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: jobs,
        });
    } catch (error) {
        logger.error('Controller::Admin::dashboardControllers::getSingleProject', error);
        next(error);
    }
};

const addProjectPayment = async (req, res, next) => {
    try {
        const { error } = await validator.createPayment(req.body);
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        }
        const payment = await DashboardServices.addPayment(req.body);
        const message = 'Payment added successfully';
        return res.status(201).json({
            statusCode: 201,
            status: true,
            message,
            data: payment,
        });
    } catch (error) {
        logger.error('Controller::Admin::dashboardControllers::addProjectPayment', error);
        next(error);
    }
};

const dashboardControllers = {
    getProjects,
    approveProject,
    getProjectMetrics,
    getSingleProject,
    addProjectPayment
};

module.exports = dashboardControllers;
