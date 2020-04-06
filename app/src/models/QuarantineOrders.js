module.exports = (sequelize, DataTypes) => {
  const QuarantineOrders = sequelize.define('QuarantineOrders', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    photo_s3_key: DataTypes.STRING
  }, {});
  QuarantineOrders.associate = function(models) {
    // associations can be defined here
    QuarantineOrders.hasMany(models.LocationReports, { foreignKey: 'order_id', sourceKey: 'id' })
    QuarantineOrders.hasMany(models.HealthReports, { foreignKey: 'order_id', sourceKey: 'id' })
    QuarantineOrders.hasMany(models.PushNotifications, { foreignKey: 'order_id', sourceKey: 'id' })
  };
  return QuarantineOrders;
};