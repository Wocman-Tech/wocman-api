const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Projects extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Projects.init({
        projectid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        customerid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        project: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        images: {
            type: DataTypes.STRING,
            allowNull: false
        },
        datetimeset: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: 'nigeria',
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanid: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        quoteamount: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanaccept: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: false
        },
        customerstart: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanstartdatetime: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        wocmanstopdatetime: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        customeracceptcomplete: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        projectreport: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        customerratewocman: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        projectcomplete: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Projects',
        tableName: 'projects',
    });

    return Projects;
};