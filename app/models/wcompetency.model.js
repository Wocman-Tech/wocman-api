const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Wcompetency extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Wcompetency.init({
        userid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        competencyid: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Wcompetency',
        tableName: 'wcompetencies',
    });

    return Wcompetency;
};