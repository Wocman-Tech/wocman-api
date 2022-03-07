'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      projectid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projecttypes',
          key: 'id',
        },
      },
      customerid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      project: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      images: {
        type: Sequelize.STRING,
        allowNull: false
      },
      datetimeset: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        defaultValue: 'nigeria',
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      wocmanid: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      quoteamount: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      wocmanaccept: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: false
      },
      customerstart: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      wocmanstartdatetime: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      wocmanstopdatetime: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      customeracceptcomplete: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      projectreport: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      customerratewocman: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      projectcomplete: {
        type: Sequelize.STRING,
        defaultValue: 0,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'in-progress', 'completed'),
        defaultValue: 'pending'
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
    await queryInterface.dropTable('projects');
  }
};
