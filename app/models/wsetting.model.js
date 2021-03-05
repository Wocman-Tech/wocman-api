module.exports = (sequelize, Sequelize) => {
    const Wsetting = sequelize.define("wsettings", {
        userid: {
            type: Sequelize.STRING
        },
        smsnotice: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: true
        },
        emailnotice: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: true
        },
        servicenotice: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: true
        },
        technicalnotice: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: true
        },
        security2fa: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: true
        },
        securityipa: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: true
        },
        paymentschedule: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: true
        }
    });
    return Wsetting;
};