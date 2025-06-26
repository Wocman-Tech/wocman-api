const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: "customerid",
        as: "customer",
      });
      Order.belongsTo(models.Resources, {
        foreignKey: "resourceid",
        as: "resource",
      });
    }
  }

  Order.init(
    {
      customerid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resourceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "successful", "failed"),
        defaultValue: "pending",
      },
      confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
    }
  );

  return Order;
};
