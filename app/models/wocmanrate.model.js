const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Wrate extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Wrate.init({
        userid: {
            type: DataTypes.INTEGER
        },
        jobid: {
            type: DataTypes.INTEGER
        },
        rateUser: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize,
        modelName: 'Wrate',
        tableName: 'wrates',
    });

    return Wrate;
};

/*  jobid : gotten projects table
    rateUser : values from 1 to 5
*/