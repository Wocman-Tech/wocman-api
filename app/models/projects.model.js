module.exports = (sequelize, Sequelize) => {
    const Projects = sequelize.define("projects", {
        projectid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        customerid: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.STRING,
            allowNull: false
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        images: {
            type: Sequelize.STRING,
            allowNull: false
        },
        datetimeset: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        country: {
            type: Sequelize.STRING,
            defaultValue: 'nigeria',
            allowNull: false
        },
        state: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanid: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        quoteamount: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanaccept: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        customerstart: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanstartdatetime: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanstopdatetime: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        customeracceptcomplete: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        projectreport: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        customerratewocman: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        projectcomplete: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        }
    });
    return Projects;
};