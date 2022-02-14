const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WocmanAccount extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    WocmanAccount.init({
        accountid: {
            type: DataTypes.INTEGER
        },
        projectid: {
            type: DataTypes.STRING
        },
        customerid: {
            type: DataTypes.STRING
        },
        customerpaid: {
            type: DataTypes.STRING
        },
        customervetadminid: {
            type: DataTypes.STRING
        },
        wocmanid: {
            type: DataTypes.STRING
        },
        wocmanreceived: {
            type: DataTypes.STRING
        },
        wocmanvetadminid: {
            type: DataTypes.STRING
        },
        closeAccount: {
            type: DataTypes.STRING
        },
        closeaccountvetadminid: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'WocmanAccount',
        tableName: 'waccounts',
    });

    return WocmanAccount;
};
