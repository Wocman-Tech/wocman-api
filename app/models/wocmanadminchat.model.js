module.exports = (sequelize, Sequelize) => {
    const ChatWocmanAdmin = sequelize.define("wachat", {
        wocmanid: {
            type: Sequelize.INTEGER
        },
        adminid: {
            type: Sequelize.INTEGER
        },
        message: {
            type: Sequelize.STRING
        },
        status: {
          type: Sequelize.STRING
        }
    });
    return ChatWocmanAdmin;
};