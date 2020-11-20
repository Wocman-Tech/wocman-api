module.exports = (sequelize, Sequelize) => {
    const ProjectType = sequelize.define("projecttype", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return ProjectType;
};