module.exports = (sequelize, Sequelize) => {
    const Ipblacklist = sequelize.define("wipblacklists", {
        ip: {
            type: Sequelize.STRING,
        },
        userid: {
            type: Sequelize.INTEGER,
        }
    });
    return Ipblacklist;
};