"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "projecttypes",
      [
        {
          name: "Mason",
          description: "Mason",
          category_id: 1,
        },
        {
          name: "Carpenter",
          description: "Carpenter",
          category_id: 1,
        },
        {
          name: "Ironbender",
          description: "Ironbender",
          category_id: 1,
        },
        {
          name: "Painter & Screeders",
          description: "Painter & Screeders",
          category_id: 1,
        },
        {
          name: "Aluminum Fabricators",
          description: "Aluminum Fabricators",
          category_id: 1,
        },
        {
          name: "Steel Fabricators",
          description: "Steel Fabricators",
          category_id: 1,
        },
        {
          name: "Solar Installers",
          description: "Solar Installers",
          category_id: 1,
        },
        {
          name: "Electricians",
          description: "Electricians",
          category_id: 1,
        },
        {
          name: "Plumbers",
          description: "Plumbers",
          category_id: 1,
        },
        {
          name: "Polystyrene Technicians",
          description: "Polystyrene Technicians",
          category_id: 1,
        },
        {
          name: "A/C Technician",
          description: "A/C Technician",
          category_id: 1,
        },
        {
          name: "Tilers",
          description: "Tilers",
          category_id: 1,
        },
        {
          name: "Generator Mechanics",
          description: "Generator Mechanics",
          category_id: 1,
        },
        {
          name: "Barber",
          description: "Barber",
          category_id: 2,
        },
        {
          name: "Gardener",
          description: "Gardener",
          category_id: 2,
        },
        {
          name: "Pedicurist",
          description: "Pedicurist",
          category_id: 2,
        },
        {
          name: "Cleaners",
          description: "Cleaners",
          category_id: 2,
        },
        {
          name: "Hair Stylist",
          description: "Hair Stylist",
          category_id: 2,
        },
        {
          name: "Engineers",
          description: "Engineers",
          category_id: 3,
        },
        {
          name: "Geologist",
          description: "Geologist",
          category_id: 3,
        },
        {
          name: "Architects",
          description: "Architects",
          category_id: 3,
        },
        {
          name: "Surveyors",
          description: "Surveyors",
          category_id: 3,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("projecttypes", null, {});
  },
};
