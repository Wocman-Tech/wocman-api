'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('projects', 'wocmanstartdatetime', {
      type: Sequelize.DATE,
    }),
    queryInterface.changeColumn('projects', 'wocmanstopdatetime', {
      type: Sequelize.DATE,
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
