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

exports.createPayment = async (body) => {
    const schema = Joi.object({
        reference: Joi.string().required(),
        amount: Joi.number().required(),
        transaction_id: Joi.string().required(),
        status: Joi.string().required(),
        project_id: Joi.number().required()
    });
    const result = schema.validate(body);
    return result;
};

exports.addProjectAmountValidation = async (body) => {
    const schema = Joi.object({
        amount: Joi.number().required(),
    });
    const result = schema.validate(body);
    return result;
};