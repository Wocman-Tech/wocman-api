"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("resourcetypes", [
      { name: "Materials", createdAt: new Date(), updatedAt: new Date() },
      { name: "Equipment", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("resourcetypes", null, {});
  },
};
