'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wsettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userid: {
        type: Sequelize.STRING
      },
      smsnotice: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
      },
      emailnotice: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
      },
      servicenotice: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
      },
      technicalnotice: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
      },
      security2fa: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
      },
      securityipa: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
      },
      paymentschedule: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
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
    await queryInterface.dropTable('wsettings');
  }
};
