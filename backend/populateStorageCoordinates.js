const { ColdStorage } = require('./models');
const LocationService = require('./services/locationService');

async function populateStorageCoordinates() {
  try {
    console.log('🔄 Populating coordinates for existing cold storages...');
    
    // Find all storages without coordinates
    const storagesWithoutCoords = await ColdStorage.findAll({
      where: {
        latitude: null,
        longitude: null
      }
    });

    console.log(`📍 Found ${storagesWithoutCoords.length} storages without coordinates`);

    if (storagesWithoutCoords.length === 0) {
      console.log('✅ All storages already have coordinates!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // Process each storage
    for (const storage of storagesWithoutCoords) {
      try {
        console.log(`🔍 Geocoding: ${storage.name} at ${storage.location}...`);
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
        
        const coords = await LocationService.geocodeAddress(storage.location);
        
        await storage.update({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        
        console.log(`✅ Updated ${storage.name}: ${coords.latitude}, ${coords.longitude}`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ Failed to geocode ${storage.name}: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n🎉 Coordinate population completed!');
    console.log(`✅ Successfully updated: ${successCount} storages`);
    console.log(`❌ Failed to update: ${failCount} storages`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating coordinates:', error);
    process.exit(1);
  }
}

populateStorageCoordinates();
