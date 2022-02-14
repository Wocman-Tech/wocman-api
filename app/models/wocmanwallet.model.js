const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WocmanWallet extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    WocmanWallet.init({
        userid: {
            type: DataTypes.INTEGER
        },
        walletid: {
            type: DataTypes.STRING
        },
        amount: {
            type: DataTypes.STRING
        },
        bankName: {
            type: DataTypes.STRING
        },
        accNumber: {
            type: DataTypes.STRING
        },
        accName: {
            type: DataTypes.STRING
        },
        accType: {
            type: DataTypes.STRING
        },
        currentwitdralamount: {
            type: DataTypes.STRING
        },
        totalwitdralamount: {
            type: DataTypes.STRING
        },
        froozeaccount: {
            type: DataTypes.STRING,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'WocmanWallet',
        tableName: 'wwallet',
    });

    return WocmanWallet;
};

/*  walletid : generated unique value
    once admin unboard a wocman
    the user would be inserted into this table with
    default values(only the walletID and userId would be entered)
*/