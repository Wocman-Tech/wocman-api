const { QueryTypes } = require('sequelize');
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
            r.name as role
        FROM
        users u
        LEFT JOIN userroles ur ON ur.userid = u.id
        LEFT JOIN roles r ON r.id = ur.roleid
        WHERE r.name = 'wocman' AND (u.firstname LIKE '%${condition}%' OR u.lastname LIKE '%${condition}%' 
        OR u.email LIKE '%${condition}%' OR u.username LIKE '%${condition}%' OR '%${condition}%' is null)
        ORDER BY u.createdAt DESC
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
    return User.findOne({
        where: {
            id: params.id
        },
        attributes: [
            'id', 
            'firstname', 
            'lastname', 
            'email', 
            'username', 
            'address',
            'country',
            'state',
            'phone',
            'image'
        ],
    });
}

const wocmanServices = {
    getAllWocman,
    getWocman
};

module.exports = wocmanServices;