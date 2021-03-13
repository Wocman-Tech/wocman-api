module.exports = (sequelize, Sequelize) => {
    const Ipblacklist = sequelize.define("wipblacklists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        },
        ip: {
            type: Sequelize.STRING,
        },
        userid: {
            type: Sequelize.INTEGER,
        }
    });
    return Ipblacklist;
};