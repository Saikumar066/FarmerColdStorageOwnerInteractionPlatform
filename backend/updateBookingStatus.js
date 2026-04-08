const { Booking } = require('./models');

async function updateBookingStatuses() {
  try {
    // Update all pending bookings to confirmed status
    const result = await Booking.update(
      { status: 'confirmed' },
      { 
        where: { status: 'pending' },
        returning: true
      }
    );
    
    console.log(`✅ Updated ${result[0]} bookings from pending to confirmed`);
    
    // Also check if any bookings should be marked as active based on dates
    const now = new Date();
    const activeResult = await Booking.update(
      { status: 'active' },
      {
        where: {
          status: 'confirmed',
          start_time: { [require('sequelize').Op.lte]: now },
          end_time: { [require('sequelize').Op.gte]: now }
        }
      }
    );
    
    console.log(`✅ Updated ${activeResult[0]} bookings to active status`);
    
    // Mark past bookings as completed
    const completedResult = await Booking.update(
      { status: 'completed' },
      {
        where: {
          status: ['confirmed', 'active'],
          end_time: { [require('sequelize').Op.lt]: now }
        }
      }
    );
    
    console.log(`✅ Updated ${completedResult[0]} bookings to completed status`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating booking statuses:', error);
    process.exit(1);
  }
}

updateBookingStatuses();
