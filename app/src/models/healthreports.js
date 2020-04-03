module.exports = (sequelize, DataTypes) => {
  const HealthReports = sequelize.define('HealthReports', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cough: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    sore_throat: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    runny_nose: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    shortness_of_breath: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    photo_s3_key: DataTypes.STRING,
    metadata: DataTypes.JSONB
  }, {});
  HealthReports.associate = function(models) {
    // associations can be defined here
    HealthReports.belongsTo(models.QuarantineOrders, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    })
  };
  return HealthReports;
};