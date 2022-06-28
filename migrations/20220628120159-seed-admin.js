'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        id: 1, 
        email: 'admin@wocmantech.com', 
        password: '$2a$08$Qp7GWTW9Gy5AmfkAl9IbbO/ixbddWIaPxU70wBQSJogcYjwQN1lke', 
        username: 'admin@wocmantech.com', 
        signuptype: 'admin'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
