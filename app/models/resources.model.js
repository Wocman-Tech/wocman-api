const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Resources extends Model {
    static associate(models) {
      // Vendor (user)
      Resources.belongsTo(models.User, {
        foreignKey: "vendorid",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        as: "vendor",
      });

      // Customer (user)
      Resources.belongsTo(models.User, {
        foreignKey: "customerid",
        as: "customer",
      });

      // Resource Type (material/equipment)
      Resources.belongsTo(models.ResourceType, {
        foreignKey: "resourceid",
        as: "resource_type",
      });

      Resources.belongsTo(models.ResourceSubType, {
        foreignKey: "subtypeid",
        as: "sub_category",
      });
    }
  }

  Resources.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      resourceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "resourcetypes",
          key: "id",
        },
      },
      vendorid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      datetimeset: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        defaultValue: "nigeria",
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      customerid: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      subtypeid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "resourcesubtypes",
          key: "id",
        },
      },
      amount: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("available", "in-cart", "purchased"),
        defaultValue: "available",
      },
    },
    {
      sequelize,
      modelName: "Resources",
      tableName: "resources",
    }
  );

  return Resources;
};
