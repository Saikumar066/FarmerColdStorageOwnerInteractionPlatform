const { Farmer, ColdStorage, Manager } = require('./models');

async function updateDatabaseSchema() {
  try {
    console.log('🔄 Updating database schema for location features...');
    
    // Sync the models to update the database schema
    await Farmer.sync({ alter: true });
    console.log('✅ Updated Farmer table with latitude/longitude columns');
    
    await Manager.sync({ alter: true });
    console.log('✅ Updated Manager table with latitude/longitude columns');
    
    await ColdStorage.sync({ alter: true });
    console.log('✅ Updated ColdStorage table with latitude/longitude columns');
    
    console.log('🎉 Database schema updated successfully!');
    console.log('📋 New columns added:');
    console.log('   - farmers.latitude (DECIMAL(10,8))');
    console.log('   - farmers.longitude (DECIMAL(11,8))');
    console.log('   - managers.latitude (DECIMAL(10,8))');
    console.log('   - managers.longitude (DECIMAL(11,8))');
    console.log('   - cold_storages.latitude (DECIMAL(10,8))');
    console.log('   - cold_storages.longitude (DECIMAL(11,8))');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
    process.exit(1);
  }
}

updateDatabaseSchema();
