module.exports = (sequelize, Sequelize) => {
    const WocmanAccount = sequelize.define("waccount", {
      	accountid: {
            type: Sequelize.INTEGER
        },
        projectid: {
            type: Sequelize.STRING
        },
        customerid: {
            type: Sequelize.STRING
        },
        customerpaid: {
            type: Sequelize.STRING
        },
        customervetadminid: {
            type: Sequelize.STRING
        },
        wocmanid: {
            type: Sequelize.STRING
        },
        wocmanreceived: {
            type: Sequelize.STRING
        },
        wocmanvetadminid: {
            type: Sequelize.STRING
        },
        closeAccount: {
            type: Sequelize.STRING
        },
        closeaccountvetadminid: {
            type: Sequelize.STRING
        }
    });
    return WocmanAccount;
};
