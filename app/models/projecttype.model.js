const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Projecttype extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Projecttype.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Projecttype',
        tableName: 'projecttype',
    });

    return Projecttype;
};