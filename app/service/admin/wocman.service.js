const { QueryTypes, fn } = require('sequelize');
const { User, sequelize } = require('../../models');

const getAllWocman = async (query) => {
    const { limit, page, search } = query;

    const fetch = (parseInt(limit, 10) * parseInt(page, 10)) - parseInt(limit, 10);

    const condition = search ? search.toLowerCase() : '';

    const countSql = `
        SELECT
            count(u.id) as total
        FROM
        users u
        LEFT JOIN userroles ur ON ur.userid = u.id
        LEFT JOIN roles r ON r.id = ur.roleid
        LEFT JOIN wskills ws ON ws.userid = u.id
        LEFT JOIN skills s ON s.id = ws.skillid
        WHERE r.name = 'wocman' AND (u.firstname LIKE '%${condition}%' OR u.lastname LIKE '%${condition}%' 
        OR u.email LIKE '%${condition}%' OR u.username LIKE '%${condition}%' OR '%${condition}%' is null)
        ORDER BY u.createdAt DESC
    `;

    const sql = `
    SELECT
        u.id,
        email,
        username,
        firstname,
        lastname,
        address,
        country,
        state,
        phone,
        image,
        u.status as user_status,
        c.name as certificate,
        c.picture as cert_url,
        r.name as role,
        p.name as skill,
        comp.name as competency
    FROM
        users u
        LEFT JOIN userroles ur ON ur.userid = u.id
        LEFT JOIN roles r ON r.id = ur.roleid
        LEFT JOIN wskills ws ON ws.userid = u.id
        LEFT JOIN projecttypes p ON p.id = ws.skillid
        LEFT JOIN wcerts c ON c.userid = u.id
        LEFT JOIN wcompetencies uc ON uc.userid = u.id
        LEFT JOIN competencies comp ON comp.id = uc.competencyid
    WHERE
        r.name = 'wocman'
        AND (u.firstname LIKE '%${condition}%' OR u.lastname LIKE '%${condition}%' 
        OR u.email LIKE '%${condition}%' OR u.username LIKE '%${condition}%' OR '%${condition}%' is null)
    ORDER BY
        u.createdAt DESC
    LIMIT ${limit} OFFSET ${fetch}
`;



    const [count] = await sequelize.query(countSql, {
        type: QueryTypes.SELECT,
    });

    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
    });
    
    const hasNextPage = ((page * limit) >= count.total) ? false : true;
    return {
        total: count.total,
        hasNextPage,
        rows: result,
    };
};

const getWocman = async (params) => {
    const sql = `
        SELECT
            u.id,
            email,
            username,
            firstname,
            lastname,
            address,
            country,
            state,
            phone,
            image,
            status,
            r.name as role,
            p.name as skill
        FROM
        users u
        LEFT JOIN userroles ur ON ur.userid = u.id
        LEFT JOIN roles r ON r.id = ur.roleid
        LEFT JOIN wskills ws ON ws.userid = u.id
        LEFT JOIN projecttypes p ON p.id = ws.skillid
        WHERE u.id = ${params.id} 
    `;

    const [result] = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
    });

    return result;
};

const suspendOrActivateWocman = async (params, query) => {
    const { status } = query;
    const renameStatus = status === 'suspend' ? 'suspended' : status;
    await User.update(
        {
            status: renameStatus,
            updatedAt: fn('now'),
        },
        {
            where: {
                id: params.id
            },
        },
    );
};

const wocmanServices = {
    getAllWocman,
    getWocman,
    suspendOrActivateWocman
};

module.exports = wocmanServices;