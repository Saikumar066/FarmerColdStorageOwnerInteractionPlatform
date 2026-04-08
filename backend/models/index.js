const Farmer = require('./Farmer');
const ColdStorage = require('./ColdStorage');
const Booking = require('./Booking');
const Admin = require('./Admin');
const Manager = require('./Manager');

// Define relationships
Farmer.hasMany(Booking, { 
  foreignKey: 'farmer_id',
  sourceKey: 'farmer_id',
  as: 'bookings'
});
Booking.belongsTo(Farmer, { 
  foreignKey: 'farmer_id',
  targetKey: 'farmer_id',
  as: 'farmer'
});

ColdStorage.hasMany(Booking, { 
  foreignKey: 'storage_id',
  sourceKey: 'storage_id',
  as: 'bookings'
});
Booking.belongsTo(ColdStorage, { 
  foreignKey: 'storage_id',
  targetKey: 'storage_id',
  as: 'cold_storage'
});

// Manager and ColdStorage relationships
Manager.hasMany(ColdStorage, {
  foreignKey: 'manager_id',
  sourceKey: 'id', 
  as: 'cold_storages'
});
ColdStorage.belongsTo(Manager, {
  foreignKey: 'manager_id',
  targetKey: 'id',
  as: 'manager'
});

// Export all models from one place
module.exports = {
  Farmer,
  Booking,
  ColdStorage,
  Admin,
  Manager
};
