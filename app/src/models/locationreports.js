module.exports = (sequelize, DataTypes) => {
  const LocationReports = sequelize.define('LocationReports', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    metadata: DataTypes.JSONB
  }, {});
  LocationReports.associate = function(models) {
    // associations can be defined here
    LocationReports.belongsTo(models.QuarantineOrders, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    })
  };
  return LocationReports;
};