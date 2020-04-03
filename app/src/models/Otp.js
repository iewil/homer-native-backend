module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    contact_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Otp.associate = function(models) {
    // associations can be defined here
  };
  return Otp;
};