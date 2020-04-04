'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(
    (t) => Promise.all([
      queryInterface.changeColumn(
        'Otps', // name of Source model
        'contact_number', // name of the key we're modifying
        {
          type: Sequelize.STRING,
          allowNull: true,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }, { transaction: t },
      ),
      queryInterface.addColumn(
        'Otps', // name of Source model
        'email', // name of the key we're adding
        {
          type: Sequelize.STRING,
          allowNull: true,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }, { transaction: t },
      ),
    ]),
  ),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(
    (t) => Promise.all(
      [
        queryInterface.changeColumn(
          'Otps', // name of Source model
          'contact_number', // key we want to remove
          {
            type: Sequelize.STRING,
            allowNull: false,
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          }, { transaction: t },
        ),
        queryInterface.removeColumn(
          'Otps', // name of Source model
          'email', // key we want to remove
          { transaction: t },
        ),
      ],
    ),
  ),
};
