const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ResourceSubType extends Model {
    static associate(models) {
      ResourceSubType.belongsTo(models.ResourceType, {
        foreignKey: "typeid",
        as: "parent_type",
      });

      ResourceSubType.hasMany(models.Resources, {
        foreignKey: "subtypeid",
        as: "resources",
      });
    }
  }

  ResourceSubType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      typeid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "resourcetypes",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "ResourceSubType",
      tableName: "resourcesubtypes",
    }
  );

  return ResourceSubType;
};
