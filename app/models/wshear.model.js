const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Wshear extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Wshear.init({
        wocmanshare: {
			type: DataTypes.STRING
	  },
	  companyshare: {
			type: DataTypes.STRING
	  }
    }, {
        sequelize,
        modelName: 'Wshear',
        tableName: 'wshears',
    });

  	return Wshear;
};