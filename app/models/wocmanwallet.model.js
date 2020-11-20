module.exports = (sequelize, Sequelize) => {
    const WocmanWallet = sequelize.define("wwallet", {
      	userid: {
            type: Sequelize.INTEGER
        },
        amount: {
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