const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasMany(models.Projects, {
                foreignKey: 'customerid',
                as: 'customer'
            });

            User.hasMany(models.Projects, {
                foreignKey: 'wocmanid',
                as: 'wocman'
            });
        }
    }

    User.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        verify_email: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        firstname: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        lastname: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        unboard: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        province: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        images: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        changepassword: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        loginlogout: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        weblogintoken: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        weblogin2fa: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        webloginipa: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        signuptype: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        certificatesupdate: {
            type: DataTypes.STRING,
            defaultValue: 0
        },
        profileupdate: {
            type: DataTypes.STRING,
            defaultValue: 0
        },
        featured: {
            type: DataTypes.STRING,
            defaultValue: 0
        },
        isSkilled: {
            type: DataTypes.STRING,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active'
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
    });

    return User;
};