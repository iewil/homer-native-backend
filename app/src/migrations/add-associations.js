module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          'LocationReports', // name of Source model
          'order_id', // name of the key we're adding 
          {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'QuarantineOrders', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          }, { transaction: t }),
        queryInterface.addColumn(
          'HealthReports', // name of Source model
          'order_id', // name of the key we're adding 
          {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'QuarantineOrders', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          }, { transaction: t }),
        queryInterface.addColumn(
          'PushNotifications', // name of Source model
          'order_id', // name of the key we're adding 
          {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'QuarantineOrders', // name of Target model
              key: 'id', // key in Target model that we're referencing
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          }, { transaction: t }),
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn(
          'LocationReports', // name of Source model
          'order_id', // key we want to remove
          { transaction: t }),
        queryInterface.removeColumn(
          'HealthReports', // name of Source model
          'order_id', // key we want to remove
          { transaction: t }),
        queryInterface.removeColumn(
          'PushNotifications', // name of Source model
          'order_id', // key we want to remove
          { transaction: t }),
      ])
    })
  }
};