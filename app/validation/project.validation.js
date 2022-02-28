const Joi = require("joi");

exports.createProject = async (body) => {
    const schema = Joi.object({
        description: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        topic: Joi.string().required(),
        projecttypeid: Joi.number().required()
    });
    const result = schema.validate(body);
    return result;
};

exports.approveStatusValidation = async (query) => {
    const schema = Joi.object({
        status: Joi.string().trim().valid('approved'),
    });
    const result = schema.validate(query);
    return result;
};

exports.getProjectsValidation = async (query) => {
    const schema = Joi.object({
        page: Joi.number().positive(),
        limit: Joi.number().positive(),
        status: Joi.string().trim().valid('approved', 'pending', 'in-progress', 'completed'),
    });
    const result = schema.validate(query);
    return result;
};