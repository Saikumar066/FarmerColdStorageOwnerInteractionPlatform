const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as needed

const Farmer = sequelize.define('Farmer', {
  farmer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  location: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  timestamps: true, // This will automatically manage createdAt and updatedAt
  tableName: 'farmers'
}, {
  tableName: 'farmers',
  timestamps: true,
});

module.exports = Farmer;
