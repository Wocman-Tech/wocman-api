module.exports = (sequelize, Sequelize) => {
    const ChatWocmanAdmin = sequelize.define("wachat", {
        senderid: {
            type: Sequelize.INTEGER
        },
        receiverid: {
            type: Sequelize.INTEGER
        },
        message: {
            type: Sequelize.STRING
        },
        messagetype: {
            type: Sequelize.STRING
        },
        messagelinks: {
            type: Sequelize.STRING
        },
        seen: {
            type: Sequelize.STRING
        },
        tracker: {
            type: Sequelize.STRING
        },
        projectid: {
            type: Sequelize.STRING
        }
    });
    return ChatWocmanAdmin;
};