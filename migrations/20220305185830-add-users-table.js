"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      verify_email: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      firstname: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      lastname: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      unboard: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      province: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      images: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      changepassword: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      loginlogout: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      weblogintoken: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      weblogin2fa: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      webloginipa: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      signuptype: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      certificatesupdate: {
        type: Sequelize.STRING,
        defaultValue: 0,
      },
      profileupdate: {
        type: Sequelize.STRING,
        defaultValue: 0,
      },
      featured: {
        type: Sequelize.STRING,
        defaultValue: 0,
      },
      isSkilled: {
        type: Sequelize.STRING,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  },
};
