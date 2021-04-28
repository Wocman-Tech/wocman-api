module.exports = (sequelize, Sequelize) => {
    const Wcompetency = sequelize.define("wcompetencies", {
        userid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        competencyid: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Wcompetency;
};