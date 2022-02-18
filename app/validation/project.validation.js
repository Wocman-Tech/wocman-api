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