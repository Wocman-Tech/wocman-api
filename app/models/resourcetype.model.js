const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ResourceType extends Model {
    static associate(models) {
      ResourceType.hasMany(models.ResourceSubType, {
        foreignKey: "typeid",
        as: "sub_categories",
      });

      ResourceType.hasMany(models.Resources, {
        foreignKey: "resourceid",
        as: "resources",
      });
    }
  }

  ResourceType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "ResourceType",
      tableName: "resourcetypes",
    }
  );

  return ResourceType;
};
