const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Wsetting extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Wsetting.init({
        userid: {
            type: DataTypes.STRING
        },
        smsnotice: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        },
        emailnotice: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        },
        servicenotice: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        },
        technicalnotice: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        },
        security2fa: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        },
        securityipa: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        },
        paymentschedule: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Wsetting',
        tableName: 'wsettings',
    });

    return Wsetting;
};