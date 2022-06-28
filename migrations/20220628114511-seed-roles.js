'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'admin',
      },
      {
        id: 2,
        name: 'wocman',
      },
      {
        id: 3,
        name: 'customer',
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {});
  }
};
