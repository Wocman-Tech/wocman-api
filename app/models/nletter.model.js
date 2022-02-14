const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Nletter extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Nletter.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Nletter',
        tableName: 'nletters',
    });

  	return Nletter;
};