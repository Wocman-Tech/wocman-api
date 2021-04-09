module.exports = (sequelize, Sequelize) => {
    const Wskills = sequelize.define("wskills", {
        userid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        skillid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING
        }
    });
    return Wskills;
};