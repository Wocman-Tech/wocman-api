module.exports = (sequelize, Sequelize) => {
    const rootAdmin = sequelize.define("rootadmin", {
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        islogin: {
        	type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isprofile: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        issettings: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        iscustomer: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        iswocman: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isproject: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isuser: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isaccount: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isroot: {
            type: Sequelize.STRING,
            defaultValue: 0,
            allowNull: false
        }
    });
    return rootAdmin;
};