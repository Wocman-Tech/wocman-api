const Joi = require("joi");

exports.getWocmanQueryValidation = async (query) => {
    const schema = Joi.object({
        page: Joi.number().positive(),
        limit: Joi.number().positive(),
        search: Joi.string().trim(),
    });
    const result = schema.validate(query);
    return result;
};