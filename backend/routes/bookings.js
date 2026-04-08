const express = require('express');
const router = express.Router();
const { Booking, ColdStorage, Farmer, Manager } = require('../models');
const notificationService = require('../services/notificationService');
const { authenticateToken, authorizeRoles, requireParamOwner, requireBodyOwner } = require('../middleware/auth');

// Debug endpoint to check data
router.get('/debug', async (req, res) => {
  try {
    const farmers = await Farmer.findAll();
    const storages = await ColdStorage.findAll();
    res.json({
      farmers: farmers.map(f => ({ farmer_id: f.farmer_id, name: f.name, phone: f.phone })),
      storages: storages.map(s => ({ storage_id: s.storage_id, name: s.name, status: s.status }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, authorizeRoles('farmer'), requireBodyOwner('farmer_id'), async (req, res) => {
  try {
    console.log('📝 Booking request received:', req.body);
    const { farmer_id, storage_id, start_time, end_time, quantity, produce, notes } = req.body;

    // Validate required fields
    if (!farmer_id || !storage_id || !start_time || !end_time || !quantity || !produce) {
      console.log('❌ Missing required fields:', { farmer_id, storage_id, start_time, end_time, quantity, produce });
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['farmer_id', 'storage_id', 'start_time', 'end_time', 'quantity', 'produce'] 
      });
    }

    console.log('✅ Creating booking with data:', { farmer_id, storage_id, start_time, end_time, quantity, produce, notes });

    // Check if farmer exists
    const farmer = await Farmer.findByPk(farmer_id);
    if (!farmer) {
      console.log('❌ Farmer not found with ID:', farmer_id);
      return res.status(400).json({ 
        message: 'Farmer not found',
        farmer_id 
      });
    }

    // Check if storage exists
    const storage = await ColdStorage.findByPk(storage_id);
    if (!storage) {
      console.log('❌ Storage not found with ID:', storage_id);
      return res.status(400).json({ 
        message: 'Storage not found',
        storage_id 
      });
    }

    console.log('✅ Farmer and storage validation passed');

    // Log the date conversion
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    console.log('📅 Date conversion:', { 
      start_time, 
      end_time, 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString(),
      isValidStart: !isNaN(startDate.getTime()),
      isValidEnd: !isNaN(endDate.getTime())
    });

    const booking = await Booking.create({
      farmer_id,
      storage_id,
      start_time: startDate,
      end_time: endDate,
      quantity,
      produce,
      notes,
      status: 'pending', // Set booking status to pending (awaiting manager approval)
    });

    // Don't change storage status here - wait for manager approval
    // await ColdStorage.update(
    //   { status: 'booked' },
    //   { where: { storage_id: storage_id } }
    // );

    console.log('✅ Booking created successfully:', booking.booking_id);

    // Send notification to the storage manager
    try {
      const notificationResult = await notificationService.sendBookingConfirmationToManager(
        booking, 
        farmer, 
        storage
      );
      
      if (notificationResult.success) {
        console.log('✅ Manager notification sent:', notificationResult.notification_id);
      } else {
        console.error('⚠️ Failed to send manager notification:', notificationResult.error);
      }
    } catch (notificationError) {
      console.error('❌ Notification service error:', notificationError);
      // Don't fail the booking if notification fails
    }

    res.json({ 
      message: 'Booking confirmed', 
      booking,
      notification_sent: true
    });
  } catch (error) {
    console.error('❌ Booking creation error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'Failed to create booking', 
      error: error.message,
      details: error.name === 'SequelizeForeignKeyConstraintError' 
        ? 'Foreign key constraint violation - check farmer_id and storage_id' 
        : 'Database error'
    });
  }
});

router.get('/', async (req, res) => {
  const bookings = await Booking.findAll({ include: [Farmer, ColdStorage] });
  res.json(bookings);
});

// GET: All bookings for a specific farmer
router.get('/farmer/:farmerId', authenticateToken, authorizeRoles('farmer'), requireParamOwner('farmerId'), async (req, res) => {
  const { farmerId } = req.params;
  try {
    console.log('Fetching bookings for farmer:', farmerId);
    
    // First check if the farmer exists
    const farmer = await Farmer.findByPk(farmerId);
    console.log('Found farmer:', farmer ? farmer.toJSON() : null);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const bookings = await Booking.findAll({
      where: { farmer_id: farmerId },
      include: [{
        model: ColdStorage,
        as: 'cold_storage',
        attributes: ['name', 'location', 'cost_per_day', 'status', 'storage_id']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found bookings:', bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error('Detailed error:', error.stack);
    res.status(500).json({ 
      message: 'Server error while fetching bookings',
      error: error.message 
    });
  }
});

module.exports = router;
