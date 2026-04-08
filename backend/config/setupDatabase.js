const sequelize = require('./database');
const { Farmer, ColdStorage, Booking, Manager } = require('../models');

async function setupDatabase() {
  try {
    // Drop and recreate all tables
    console.log('🔄 Dropping and recreating all tables...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Database schema synchronized');

    // Create test manager
    console.log('📝 Creating test manager...');
    const testManager = await Manager.create({
      username: 'testmanager',
      email: 'manager@test.com',
      phone: '9876543211',
      password: 'password123',
      city: 'Test City'
    });
    console.log('✅ Test manager created with ID:', testManager.id);

    // Create test cold storages
    console.log('📝 Creating test cold storages...');
    const coldStorages = await ColdStorage.bulkCreate([
      {
        name: 'Cool Storage 1',
        location: 'Test Location 1',
        temperature: '4°C',
        capacity: 1000,
        cost_per_day: 100.00,
        type: 'vegetables',
        status: 'vacant',
        manager_id: testManager.id
      },
      {
        name: 'Cool Storage 2',
        location: 'Test Location 2',
        temperature: '2°C',
        capacity: 2000,
        cost_per_day: 150.00,
        type: 'fruits',
        status: 'vacant',
        manager_id: testManager.id
      }
    ]);
    console.log('✅ Test cold storages created');

    // Create test farmer
    console.log('📝 Creating test farmer...');
    const testFarmer = await Farmer.create({
      name: 'Test Farmer',
      phone: '9876543210',
      location: 'Test Location',
      password: 'password123'
    });
    console.log('✅ Test farmer created with ID:', testFarmer.farmer_id);

    // Create test bookings
    console.log('📝 Creating test bookings...');
    await Booking.bulkCreate([
      {
        farmer_id: testFarmer.farmer_id,
        storage_id: coldStorages[0].storage_id,
        start_time: new Date(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        quantity: '500 kg',
        produce: 'Tomatoes',
        status: 'confirmed'
      },
      {
        farmer_id: testFarmer.farmer_id,
        storage_id: coldStorages[1].storage_id,
        start_time: new Date(),
        end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        quantity: '300 kg',
        produce: 'Apples',
        status: 'pending'
      }
    ]);
    console.log('✅ Test bookings created');

    console.log('🎉 Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

// Export the setup function
module.exports = setupDatabase;