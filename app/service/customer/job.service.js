const { Category, User, Projecttype, Projects } = require('../../models');

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

const getCustomerJobs = async (customerid) => {
    const projects = await Projects.findAll({
        where: {
            customerid
        },
        include: [
            {
                model: Projecttype,
                as: 'project_subcategory',
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            },
            {
                model: User,
                as: 'customer',
                attributes: ['id', 'firstname', 'lastname', 'email', 'username'],
            },
            {
                model: User,
                as: 'wocman',
                attributes: ['id', 'firstname', 'lastname', 'email', 'username'],
            },
        ],
    });

    const data = JSON.parse(JSON.stringify(projects))
    
    return data.map((el) => {
        const imagesArray = {
          images: el.images.split('/XX98XX')
        }
        return {
          ...el,
          ...imagesArray,
        }
      });
};

const jobServices = {
    jobCategory,
    getCustomerJobs
};

module.exports = jobServices;