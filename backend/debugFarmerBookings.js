const { Farmer, Booking, ColdStorage } = require('./models');

async function debugFarmerBookings() {
  try {
    console.log('🔍 Debugging farmer bookings...\n');

    // Get all farmers
    const farmers = await Farmer.findAll();
    console.log('📋 All Farmers:');
    farmers.forEach(farmer => {
      console.log(`  - ID: ${farmer.farmer_id}, Name: ${farmer.name}, Phone: ${farmer.phone}`);
    });

    // Get all bookings
    const bookings = await Booking.findAll({
      include: [{
        model: ColdStorage,
        as: 'cold_storage'
      }]
    });
    console.log('\n📋 All Bookings:');
    bookings.forEach(booking => {
      console.log(`  - ID: ${booking.booking_id}, Farmer ID: ${booking.farmer_id}, Status: ${booking.status}, Storage: ${booking.cold_storage?.name || 'N/A'}`);
    });

    // Check specific farmer bookings
    if (farmers.length > 0) {
      const firstFarmer = farmers[0];
      console.log(`\n🎯 Bookings for Farmer ID ${firstFarmer.farmer_id} (${firstFarmer.name}):`);
      
      const farmerBookings = await Booking.findAll({
        where: { farmer_id: firstFarmer.farmer_id },
        include: [{
          model: ColdStorage,
          as: 'cold_storage'
        }]
      });

      if (farmerBookings.length > 0) {
        farmerBookings.forEach(booking => {
          console.log(`  ✅ Booking ID: ${booking.booking_id}, Status: ${booking.status}, Storage: ${booking.cold_storage?.name || 'N/A'}`);
        });
      } else {
        console.log('  ❌ No bookings found for this farmer');
      }
    }

    console.log('\n🔗 API Test URL:');
    if (farmers.length > 0) {
      console.log(`  GET http://localhost:5000/api/bookings/farmer/${farmers[0].farmer_id}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
}

debugFarmerBookings();
