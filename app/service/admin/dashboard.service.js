const { QueryTypes, fn } = require('sequelize');
const { User, Projecttype, Projects, sequelize } = require('../../models');

const getProjectStatusCount = async () => {
    const sql = `
        SELECT
            count(case when status = 'pending' then status end) as pending_job,
            count(case when status = 'approved' then status end) as approved_job,
            count(case when status = 'in-progress' then status end) as progess_job,
            count(case when status = 'completed' then status end) as completed_job
        FROM projects     
    `;
    return sequelize.query(sql, {
        type: QueryTypes.SELECT,
    });
};

const getProjects = async (query) => {
    const fetch = (parseInt(query.limit, 10) * parseInt(query.page, 10)) - parseInt(query.limit, 10);
    let filter = {};
    const data = query;
    const {limit, page, ...newData} = data;

    filter = {
        ...newData
    }

    const projects = await Projects.findAndCountAll({
        where: filter,
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
        order: [['createdAt', 'DESC']],
        offset: fetch,
        limit: Number(query.limit),
    });

    const result = JSON.parse(JSON.stringify(projects))

    const rows = result.rows.map((el) => {
        const imagesArray = {
            images: el.images.split('/XX98XX')
        }
        return {
            ...el,
            ...imagesArray,
        }
    });

    const [statusCount] = await getProjectStatusCount();
    return {
        ...statusCount,
        total: result.count,
        rows
    }
};

const approveJob = async (params, query) => {
    const { status } = query;

    await Projects.update(
        {
            status,
            updatedAt: fn('now'),
        },
        {
            where: {
                id: params.id
            },
        },
    );
};

const dashboardServices = {
    getProjects,
    approveJob
};

module.exports = dashboardServices;