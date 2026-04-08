const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define(
  'bookings',
  {
    booking_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    farmer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'farmers',
        key: 'farmer_id'
      }
    },
    storage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cold_storages',
        key: 'storage_id'
      }
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    produce: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled'),
      defaultValue: 'pending'
    }
  },
  {
    tableName: 'bookings',
    underscored: true,
    timestamps: true
  }
);

module.exports = Booking;
