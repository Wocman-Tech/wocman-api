'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wwallets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userid: {
        type: Sequelize.INTEGER
      },
      walletid: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.STRING
      },
      bankName: {
        type: Sequelize.STRING
      },
      accNumber: {
        type: Sequelize.STRING
      },
      accName: {
        type: Sequelize.STRING
      },
      accType: {
        type: Sequelize.STRING
      },
      currentwitdralamount: {
        type: Sequelize.STRING
      },
      totalwitdralamount: {
        type: Sequelize.STRING
      },
      froozeaccount: {
        type: Sequelize.STRING,
        defaultValue: 0
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
    await queryInterface.dropTable('wwallets');
  }
};
