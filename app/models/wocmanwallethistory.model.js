const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WocmanWalletHistory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    WocmanWalletHistory.init({
        walletid: {
            type: DataTypes.STRING
        },
        userid: {
            type: DataTypes.INTEGER
        },
        transactiontype: {
            type: DataTypes.STRING
        },
        amount: {
            type: DataTypes.STRING
        },
        transactionmode: {
            type: DataTypes.STRING
        },
        transactiondescription: {
            type: DataTypes.STRING
        },
        transactiondate: {
            type: DataTypes.STRING
        },
        transactionstatus: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'WocmanWalletHistory',
        tableName: 'wwallethistories',
    });

    return WocmanWalletHistory;
};

/*  walletid : gotten from the wocmanwallet table
    transactiontype : either payment or witdrawal
    transactionmode : online transfer, bank or teller
    transactiondescription : the reason for transaction
    transactionstatus : the situation of the transcation(delivered or not)
    every time money is added or removed from the wocman wallet, this table has to be updated
*/