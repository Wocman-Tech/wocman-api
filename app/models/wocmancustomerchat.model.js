module.exports = (sequelize, Sequelize) => {
    const ChatWocmanCustomer = sequelize.define("wcchat", {
        senderid: {
            type: Sequelize.INTEGER
        },
        receiverid: {
            type: Sequelize.INTEGER
        },
        message: {
            type: Sequelize.STRING
        }
    });
    return ChatWocmanCustomer;
};