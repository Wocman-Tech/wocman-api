"use strict";

module.exports = {
  up: async (queryInterface) => {
    const [types] = await queryInterface.sequelize.query(
      `SELECT id, name FROM resourcetypes`
    );

    const materialsId = types.find((t) => t.name === "Materials")?.id;
    const equipmentId = types.find((t) => t.name === "Equipment")?.id;

    const subtypes = [
      "Structural Materials",
      "Finishing Materials",
      "Doors & Windows",
      "Plumbing Materials",
      "Electrical Materials",
      "Mechanical & HVAC Materials",
      "Roofing & Ceiling Materials",
      "Formwork & Scaffolding",
      "General Building Materials",
      "Specialized Vendors",
    ].map((name) => ({
      name,
      typeid: materialsId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    subtypes.push(
      ...[
        "Earthmoving Equipment",
        "Compaction Equipment",
        "Concrete & Masonry Equipment",
        "Lifting & Hoisting Equipment",
        "Power Tools & Hand Tools",
        "Scaffolding & Access Equipment",
        "Water & Pumping Equipment",
        "Electrical Equipment",
        "Surveying & Measurement Tools",
        "Finishing Equipment",
        "Safety & Site Equipment",
        "Specialized Equipment",
      ].map((name) => ({
        name,
        typeid: equipmentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    await queryInterface.bulkInsert("resourcesubtypes", subtypes);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("resourcesubtypes", null, {});
  },
};
