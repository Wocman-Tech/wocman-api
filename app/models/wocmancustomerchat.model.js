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
            WcChat.belongsTo(models.User, {
                foreignKey: 'senderid',
                as: 'sender'
            });

            WcChat.belongsTo(models.User, {
                foreignKey: 'receiverid',
                as: 'receiver'
            });

            WcChat.belongsTo(models.Projects, {
                foreignKey: 'projectid',
                as: 'project'
            });
        }
    }

    WcChat.init({
        senderid: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        receiverid: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
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
            type: DataTypes.INTEGER,
            references: {
                model: 'projects',
                key: 'id',
            },
        }
    }, {
        sequelize,
        modelName: 'WcChat',
        tableName: 'wcchats',
    });

    return WcChat;
};