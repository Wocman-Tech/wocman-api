const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Skills extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Skills.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        categoryid: {
        	type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Skills',
        tableName: 'skills',
    });

    return Skills;
};