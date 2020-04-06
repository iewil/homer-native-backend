module.exports = (sequelize, DataTypes) => {
  const AdminUsers = sequelize.define('AdminUsers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {});
  AdminUsers.associate = function(models) {
    // associations can be defined here
  };
  return AdminUsers;
};
