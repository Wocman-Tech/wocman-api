'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wskills', {
      id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
      },
      userid: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id',
        },
      },
      skillid: {
          type: Sequelize.INTEGER,
          references: {
            model: 'projecttypes',
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
    await queryInterface.dropTable('wskills');
  }
};
