const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: "customerid",
        as: "customer",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      Cart.belongsTo(models.Resources, {
        foreignKey: "resourceid",
        as: "resource",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Cart.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customerid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resourceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "carts",
      indexes: [
        {
          unique: true,
          fields: ["customerid", "resourceid"],
        },
      ],
    }
  );

  return Cart;
};
