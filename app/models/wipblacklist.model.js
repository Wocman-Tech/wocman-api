const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Ipblacklist extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Ipblacklist.init({
        ip: {
            type: DataTypes.STRING,
        },
        userid: {
            type: DataTypes.INTEGER,
        },
        ipmode: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        ipotp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'Ipblacklist',
        tableName: 'wipblacklists',
    });

    return Ipblacklist;
};