module.exports = (sequelize, Sequelize) => {
    const WocmanWalletHistory = sequelize.define("wwallethistory", {
      	walletid: {
            type: Sequelize.INTEGER
        },
        userid: {
            type: Sequelize.INTEGER
        },
        transactiontype: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.STRING
        },
        transactionmode: {
            type: Sequelize.STRING
        },
        transactiondescription: {
            type: Sequelize.STRING
        },
        transactiondate: {
            type: Sequelize.STRING
        },
        transactionstatus: {
            type: Sequelize.STRING
        }
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