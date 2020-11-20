module.exports = (sequelize, Sequelize) => {
    const Contactus = sequelize.define("contactus", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        phone: {
            type: Sequelize.STRING,
        },
        enquiry: {
            type: Sequelize.STRING,
            allowNull: false
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return Contactus;
};