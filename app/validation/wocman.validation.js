const Joi = require("joi");

exports.getWocmanQueryValidation = async (query) => {
    const schema = Joi.object({
        page: Joi.number().positive(),
        limit: Joi.number().positive(),
        search: Joi.string().trim().allow(null, ''),
    });
    const result = schema.validate(query);
    return result;
};

exports.suspendOrActivateWocmanValidation = async (query) => {
    const schema = Joi.object({
        status: Joi.string().trim().valid('active', 'suspend').required(),
    });
    const result = schema.validate(query);
    return result;
};
