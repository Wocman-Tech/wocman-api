'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('rootadmins', [
      {
        id: 1, 
        email: 'admin@wocmantech.com', 
        isroot: 1
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('rootadmins', null, {});
  }
};
