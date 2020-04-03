'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('HealthReports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      temperature: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      cough: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      sore_throat: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      runny_nose: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      shortness_of_breath: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      photo_s3_key: {
        type: Sequelize.STRING
      },
      metadata: {
        type: Sequelize.JSONB
      },
      createdAt: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('HealthReports');
  }
};