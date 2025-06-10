const Joi = require("joi");

exports.createProject = async (body) => {
  const schema = Joi.object({
    description: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().trim().lowercase({ convert: true }).required(),
    topic: Joi.string().required(),
    projecttypeid: Joi.number().required(),
    startDate: Joi.date().required(),
  });
  const result = schema.validate(body);
  return result;
};

exports.approveStatusValidation = async (query, string) => {
  const schema = Joi.object({
    status: Joi.string().trim().valid(string).required(),
  });
  const result = schema.validate(query);
  return result;
};

exports.getProjectsValidation = async (query) => {
  const validStatuses = ["approved", "pending", "in-progress", "completed"];
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
    status: Joi.string()
      .custom((value, helpers) => {
        if (value === "all") return value;

        const statuses = value.split(",");
        const isValid = statuses.every((s) => validStatuses.includes(s));
        if (!isValid) {
          return helpers.message(
            `"status" must be one or more of [${validStatuses.join(
              ", "
            )}] or "all"`
          );
        }
        return value;
      })
      .optional(),
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
    project_id: Joi.number().required(),
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
