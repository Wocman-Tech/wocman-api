"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("resources", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      resourceid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "resourcetypes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      subtypeid: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "resourcesubtypes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      vendorid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      resource: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      images: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      datetimeset: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },

      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "nigeria",
      },

      state: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },

      customerid: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        defaultValue: null,
      },

      amount: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },

      status: {
        type: Sequelize.ENUM("available", "in-cart", "purchased"),
        allowNull: false,
        defaultValue: "available",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("resources");
  },
};
