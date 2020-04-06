module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
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