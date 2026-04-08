const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // adjust path if needed

const Admin = sequelize.define('admin', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'admins',
  timestamps: false, // disable if you don't have createdAt/updatedAt
});

module.exports = Admin;
