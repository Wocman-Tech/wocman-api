module.exports = (sequelize, Sequelize) => {
    const Competency = sequelize.define("competencies", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Competency;
};