const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ColdStorage = sequelize.define('cold_storages', {
  storage_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  temperature: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cost_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g., "Vegetables", "Fruits", "Grains"
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('vacant', 'full', 'available', 'booked'),
    defaultValue: 'vacant',
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ColdStorage;
