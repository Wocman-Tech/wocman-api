const Joi = require("joi");

exports.createChatValidation = async (body) => {
    const schema = Joi.object({
        receiverId: Joi.number().integer().min(1).required(),
        projectId: Joi.number().integer().min(1).required(),
        message: Joi.string().min(1).max(225).required(),
        messageType: Joi.string().trim().valid('media', 'text').required(),
    });
    const result = schema.validate(body);
    return result;
};

