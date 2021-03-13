module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        verify_email: {
            type: Sequelize.STRING,
            defaultValue: 1,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        firstname: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        lastname: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        unboard: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        address: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        country: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        state: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        province: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        phone: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        image: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        images: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        changepassword: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        loginlogout: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        weblogintoken: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        weblogin2fa: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        webloginipa: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        },
        signuptype: {
            type: Sequelize.STRING,
            defaultValue: null,
            allowNull: true
        }
    });
    return User;
};