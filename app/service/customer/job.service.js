const { Category, Projecttype } = require('../../models');

const jobCategory = async () => {
    const categories = await Category.findAll({
        include: [
            {
                model: Projecttype,
                as: 'sub_category',
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