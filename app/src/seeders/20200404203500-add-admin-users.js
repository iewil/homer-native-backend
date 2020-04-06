module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'AdminUsers',
    [
      {
        id: 1,
        email: 'test@agency.gov.sg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        email: 'homer@agency.gov.sg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  ),

  down: async (queryInterface, Sequelize) => queryInterface.bulkDelete(
    'AdminUsers',
    null,
    {},
  ),
};
