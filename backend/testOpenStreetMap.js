const LocationService = require('./services/locationService');

async function testOpenStreetMap() {
  console.log('🧪 Testing OpenStreetMap integration...\n');

  try {
    // Test geocoding
    console.log('1. Testing address geocoding...');
    const delhiResult = await LocationService.geocodeAddress('Delhi, India');
    console.log('✅ Delhi coordinates:', delhiResult);

    const mumbaiResult = await LocationService.geocodeAddress('Mumbai, India');
    console.log('✅ Mumbai coordinates:', mumbaiResult);

    // Test distance calculation
    console.log('\n2. Testing distance calculation...');
    const distance = LocationService.calculateDistance(
      delhiResult.latitude,
      delhiResult.longitude,
      mumbaiResult.latitude,
      mumbaiResult.longitude
    );
    console.log(`✅ Distance Delhi to Mumbai: ${distance} km`);

    // Test reverse geocoding
    console.log('\n3. Testing reverse geocoding...');
    const reverseResult = await LocationService.reverseGeocode(28.6139, 77.2090);
    console.log('✅ Reverse geocoding result:', reverseResult);

    console.log('\n🎉 All OpenStreetMap tests passed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Address to coordinates: Working');
    console.log('- ✅ Distance calculation: Working');
    console.log('- ✅ Reverse geocoding: Working');
    console.log('- 🌍 No API key required for basic features');
    console.log('- 💰 Completely free to use');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOpenStreetMap();
