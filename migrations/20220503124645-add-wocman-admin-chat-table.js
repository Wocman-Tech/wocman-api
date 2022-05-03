'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wachats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      senderid: {
        type: Sequelize.INTEGER
      },
      receiverid: {
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.STRING
      },
      messagetype: {
        type: Sequelize.STRING
      },
      messagelinks: {
        type: Sequelize.STRING
      },
      seen: {
        type: Sequelize.STRING
      },
      tracker: {
        type: Sequelize.STRING
      },
      projectid: {
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
    await queryInterface.dropTable('wachats');
  }
};
