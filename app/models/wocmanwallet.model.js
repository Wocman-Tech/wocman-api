module.exports = (sequelize, Sequelize) => {
    const WocmanWallet = sequelize.define("wwallet", {
      	userid: {
            type: Sequelize.INTEGER
        },
        walletid: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.STRING
        },
        bankName: {
            type: Sequelize.STRING
        },
        accNumber: {
            type: Sequelize.STRING
        },
        accName: {
            type: Sequelize.STRING
        },
        accType: {
            type: Sequelize.STRING
        },
        currentwitdralamount: {
            type: Sequelize.STRING
        },
        totalwitdralamount: {
            type: Sequelize.STRING
        }
    });
    return WocmanWallet;
};

/*  walletid : generated unique value
    once admin unboard a wocman
    the user would be inserted into this table with
    default values(only the walletID and userId would be entered)
*/