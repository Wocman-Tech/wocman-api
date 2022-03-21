const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Wskills extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Wskills.belongsTo(models.Projecttype, {
                foreignKey: 'skillid',
                as: 'project_subcategory'
            });
            Wskills.belongsTo(models.User, {
                foreignKey: 'userid',
                as: 'wocman'
            });
        }
    }

    Wskills.init({
        userid: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        skillid: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'projecttypes',
                key: 'id',
            },
        },
    }, {
        sequelize,
        modelName: 'Wskills',
        tableName: 'wskills',
    });

    return Wskills;
};