module.exports = (sequelize, Sequelize) => {
    const Skills = sequelize.define("skills", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Skills;
};