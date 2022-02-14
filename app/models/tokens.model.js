const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Mtoken extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Mtoken.init({
        token: {
			type: DataTypes.STRING,
	  }
    }, {
        sequelize,
        modelName: 'Mtoken',
        tableName: 'mtokens',
    });

  	return Mtoken;
};