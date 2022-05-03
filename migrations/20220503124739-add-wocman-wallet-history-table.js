'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wwallethistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      walletid: {
        type: Sequelize.STRING
      },
      userid: {
        type: Sequelize.INTEGER
      },
      transactiontype: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.STRING
      },
      transactionmode: {
        type: Sequelize.STRING
      },
      transactiondescription: {
        type: Sequelize.STRING
      },
      transactiondate: {
        type: Sequelize.STRING
      },
      transactionstatus: {
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
    await queryInterface.dropTable('wwallethistories');
  }
};
