'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('skills', [
      {
        id: 1,
        categoryid: 1,
        name: 'Barbing Services'
      },
      {
        id: 2,
        categoryid: 1,
        name: 'Plumbering Services'
      },
      {
        id: 3,
        categoryid: 2,
        name: 'Electrical Installations and Maintenance'
      },
      {
        id: 4,
        categoryid: 3,
        name: "Mechanical Installations and Maintenance"
      },
      {
        id: 5,
        categoryid: 2,
        name: "Computer, accessories Installations and Maintenance"
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('skills', null, {});
  }
};
