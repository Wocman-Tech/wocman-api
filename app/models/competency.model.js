const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Competency extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Competency.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Competency',
        tableName: 'competencies',
    });

    return Competency;
};