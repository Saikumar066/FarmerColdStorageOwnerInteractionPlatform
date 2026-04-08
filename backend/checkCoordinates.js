const { Farmer, ColdStorage } = require('./models');

async function checkCoordinates() {
  try {
    console.log('🔍 Checking farmer and storage coordinates...\n');

    // Check farmers
    const farmers = await Farmer.findAll();
    console.log('👨‍🌾 Farmers with coordinates:');
    farmers.forEach(farmer => {
      console.log(`  ID: ${farmer.farmer_id}, Name: ${farmer.name}, Phone: ${farmer.phone}`);
      console.log(`      Lat: ${farmer.latitude}, Lng: ${farmer.longitude}`);
      console.log(`      Location: ${farmer.location}\n`);
    });

    // Check cold storages
    const storages = await ColdStorage.findAll();
    console.log('🏢 Cold Storages with coordinates:');
    storages.forEach(storage => {
      console.log(`  ID: ${storage.storage_id}, Name: ${storage.name}`);
      console.log(`      Lat: ${storage.latitude}, Lng: ${storage.longitude}`);
      console.log(`      Location: ${storage.location}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCoordinates();
