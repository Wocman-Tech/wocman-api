const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProjectType extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    ProjectType.init({
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
        modelName: 'ProjectType',
        tableName: 'projecttypes',
    });

    const WocmanRate = sequelize.define("wrate", {
      	userid: {
            type: DataTypes.INTEGER
        },
        jobid: {
            type: DataTypes.INTEGER
        },
        rateUser: {
            type: DataTypes.INTEGER
        }
    });
    return WocmanRate;
};

/*  jobid : gotten projects table
    rateUser : values from 1 to 5
*/