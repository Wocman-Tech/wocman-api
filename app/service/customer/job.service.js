const { Category, Skills } = require('../../models');

const jobCategory = async () => {
    const categories = await Category.findAll({
        include: [
            {
                model: Skills,
                as: 'skills',
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            },
        ],
    });
    return categories;
};

const jobServices = {
    jobCategory
};

module.exports = jobServices;