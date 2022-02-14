const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WcChat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    WcChat.init({
        senderid: {
            type: DataTypes.INTEGER
        },
        receiverid: {
            type: DataTypes.INTEGER
        },
        message: {
            type: DataTypes.STRING
        },
        chattime: {
            type: DataTypes.STRING
        },
        messagetype: {
            type: DataTypes.STRING
        },
        messagelinks: {
            type: DataTypes.STRING
        },
        seen: {
            type: DataTypes.STRING
        },
        tracker: {
            type: DataTypes.STRING
        },
        projectid: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'WcChat',
        tableName: 'wcchats',
    });

    return WcChat;
};