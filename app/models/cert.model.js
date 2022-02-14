const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cert extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Cert.init({
        userid: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        picture: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        issue_date: {
            type: DataTypes.STRING,
        }
    }, {
        sequelize,
        modelName: 'Cert',
        tableName: 'wcerts',
    });   

    return Cert;
};