module.exports = (sequelize, Sequelize) => {
    const Wcategory = sequelize.define("wcategories", {
        userid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        categoryid: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Wcategory;
};