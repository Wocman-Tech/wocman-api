'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Technicians',
      },
      {
        id: 2,
        name: 'Tradesmen',
      },
      {
        id: 3,
        name: 'Professionals',
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categories', null, {});
  }
};
