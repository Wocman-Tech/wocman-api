'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('competencies', [
      {
        id: 1,
        name: 'Beginner',
      },
      {
        id: 2,
        name: 'Intermediate',
      },
      {
        id: 3,
        name: 'Experienced',
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('competencies', null, {});
  }
};
