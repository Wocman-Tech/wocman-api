'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('waccounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      accountid: {
        type: Sequelize.INTEGER
      },
      projectid: {
        type: Sequelize.STRING
      },
      customerid: {
        type: Sequelize.STRING
      },
      customerpaid: {
        type: Sequelize.STRING
      },
      customervetadminid: {
        type: Sequelize.STRING
      },
      wocmanid: {
        type: Sequelize.STRING
      },
      wocmanreceived: {
        type: Sequelize.STRING
      },
      wocmanvetadminid: {
        type: Sequelize.STRING
      },
      closeAccount: {
        type: Sequelize.STRING
      },
      closeaccountvetadminid: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('waccounts');
  }
};