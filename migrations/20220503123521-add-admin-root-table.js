'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rootadmins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      islogin: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      isprofile: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      issettings: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      iscustomer: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      iswocman: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      isproject: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      isuser: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      isaccount: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      isroot: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rootadmins');
  }
};
