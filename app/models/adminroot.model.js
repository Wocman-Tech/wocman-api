const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RootAdmin extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    RootAdmin.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        islogin: {
        	type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isprofile: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        issettings: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        iscustomer: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        iswocman: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isproject: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isuser: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isaccount: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        isroot: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'RootAdmin',
        tableName: 'rootadmins',
    });
   
    return RootAdmin;
};