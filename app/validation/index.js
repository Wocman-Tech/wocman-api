const Joi = require("joi");

exports.paginationValidation = async (query) => {
    const schema = Joi.object({
        page: Joi.number().positive(),
        limit: Joi.number().positive(),
    });
    const result = schema.validate(query);
    return result;
};
