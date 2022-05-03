'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wcchats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      senderid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      receiverid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      message: {
        type: Sequelize.STRING
      },
      chattime: {
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
        type: Sequelize.INTEGER,
        references: {
          model: 'projects',
          key: 'id',
        },
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
    await queryInterface.dropTable('wcchats');
  }
};
