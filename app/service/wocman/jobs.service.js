const { QueryTypes, fn, Op } = require('sequelize');
const { Projects, sequelize } = require('../../models');

const getApprovedJobs = async (query, userId) => {
    const { limit, page } = query;

    const fetch = (parseInt(limit, 10) * parseInt(page, 10)) - parseInt(limit, 10);

    const countSql = `
        SELECT
            count(*) as total
        FROM projects p
        LEFT JOIN projecttypes ON projecttypes.id = p.projectid
        INNER JOIN wskills ON wskills.skillid = projecttypes.id
        LEFT JOIN users ON users.id = wskills.userid
        WHERE (LOWER(users.state) = LOWER(p.city)) AND p.status = 'approved' AND userid = ${userId} AND p.wocmanid is null 
        ORDER BY p.createdAt DESC
    `;

    const sql = `
        SELECT
            p.*,
            projecttypes.name as project_subcategory
        FROM projects p
        LEFT JOIN projecttypes ON projecttypes.id = p.projectid
        INNER JOIN wskills ON wskills.skillid = projecttypes.id
        LEFT JOIN users ON users.id = wskills.userid
        WHERE (LOWER(users.state) = LOWER(p.city)) AND p.status = 'approved' AND userid = ${userId} AND p.wocmanid is null
        ORDER BY p.createdAt DESC
        LIMIT ${limit} OFFSET ${fetch}
    `;

    const [count] = await sequelize.query(countSql, {
        type: QueryTypes.SELECT,
    });

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
    });

    const rows = result.map((el) => {
        const imagesArray = {
            images: (el.images.length === 0) ? [] : el.images.split('/XX98XX')
        }
        return {
            ...el,
            ...imagesArray,
        }
    });

    const hasNextPage = ((page * limit) >= count.total) ? false : true;
    return {
        total: count.total,
        hasNextPage,
        rows,
    };
};

const acceptJob = async (params, query, userId) => {
    const { status } = query;
    const project = await Projects.findOne({
        where: {
            id: params.id,
            status: 'approved',
            wocmanid: {
                [Op.is]: null
            }
        }
    })
    if (!project) {
        throw {
            statusCode: 400,
            status: false,
            message: "Sorry you can not accept this job",
            data: []
        };
    }
    await Projects.update(
        {
            status,
            wocmanid: userId,
            wocmanstartdatetime: fn('now'),
            updatedAt: fn('now'),
        },
        {
            where: {
                id: params.id
            },
        },
    );
};

const completeJob = async (params, query, userId) => {
    const { status } = query;
    const project = await Projects.findOne({
        where: {
            id: params.id,
            status: 'in-progress',
            wocmanid: userId
        }
    })
    if (!project) {
        throw {
            statusCode: 400,
            status: false,
            message: "You cannot complete job right now, contact support",
            data: []
        };
    }
    await Projects.update(
        {
            status,
            wocmanid: userId,
            wocmanstopdatetime: fn('now'),
            updatedAt: fn('now'),
        },
        {
            where: {
                id: params.id
            },
        },
    );
};

const jobServices = {
    getApprovedJobs,
    acceptJob,
    completeJob
};

module.exports = jobServices;