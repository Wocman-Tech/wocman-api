module.exports = (sequelize, Sequelize) => {
    const Cert = sequelize.define("wcerts", {
        userid: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        picture: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        issue_date: {
            type: Sequelize.STRING,
        }
    });
    return Cert;
};