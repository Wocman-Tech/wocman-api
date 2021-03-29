module.exports = (sequelize, Sequelize) => {
    const Ipblacklist = sequelize.define("wipblacklists", {
        ip: {
            type: Sequelize.STRING,
        },
        userid: {
            type: Sequelize.INTEGER,
        },
        ipmode: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        ipotp: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });
    return Ipblacklist;
};