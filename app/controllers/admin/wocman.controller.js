const WocmanServices = require('../../service/admin/wocman.service');
const { getWocmanQueryValidation } = require('../../validation/wocman.validation');


const getAllWocman = async (req, res, next) => {
    try {
        if (!req.query.limit) req.query.limit = 10;
        if (!req.query.page) req.query.page = 1;

        const { error } = await getWocmanQueryValidation(req.query);
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        }

        const wocmans = await WocmanServices.getAllWocman(req.query);
        const message = 'Wocmans fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: wocmans,
        });
    } catch (error) {
        logger.error('Controller::Admin::wocmanControllers::getAllWocman', error);
        next(error);
    }
};

const getWocman = async (req, res, next) => {
    try {
        const jobs = await WocmanServices.getWocman(req.params);
        const message = 'Wocman fetched successfully';
        return res.status(200).json({
            statusCode: 200,
            status: true,
            message,
            data: jobs,
        });
    } catch (error) {
        logger.error('Controller::Admin::wocmanControllers::getWocman', error);
        next(error);
    }
};

const wocmanControllers = {
    getAllWocman,
    getWocman
};

module.exports = wocmanControllers;