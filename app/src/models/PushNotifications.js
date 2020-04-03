module.exports = (sequelize, DataTypes) => {
  const PushNotifications = sequelize.define('PushNotifications', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    push_notification_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    platform: {
      type: DataTypes.ENUM,
      values: ['ios', 'android']
    }
  }, {});
  PushNotifications.associate = function(models) {
    // associations can be defined here
    PushNotifications.belongsTo(models.QuarantineOrders, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'id',
        allowNull: false
      }
    })
  };
  return PushNotifications;
};