const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not set. Using a development fallback secret.');
}

// Routes
const farmers = require('./routes/farmers');
const storages = require('./routes/storages');
const bookings = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');        // ✅ NEW
const managerRoutes = require('./routes/manager');    // ✅ NEW
const notificationRoutes = require('./routes/notifications'); // ✅ NEW

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/farmers', farmers);
app.use('/api/storages', storages);
app.use('/api/bookings', bookings);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);        // ✅ NEW
app.use('/api/managers', managerRoutes);    // ✅ NEW
app.use('/api/notifications', notificationRoutes); // ✅ NEW

// Test endpoint
app.get('/', (req, res) => {
  res.send('🌾 AgroChill Booking API is running!');
});

// Sync database
const syncDatabase = async () => {
  try {
    const sequelize = require('./config/database');
    const { Booking, ColdStorage, Farmer, Manager, Admin } = require('./models');
    
    console.log('Initializing database...');
    
    try {
      // Only sync tables (create if not exists), don't drop existing data
      await sequelize.sync({ alter: false }); // Changed from force: true
      
      console.log('✅ Database schema synchronized');

      // Check if we need to create demo data
      const farmerCount = await Farmer.count();
      if (farmerCount === 0) {
        console.log('📝 No farmers found, creating demo data...');
        
        // Create test farmer only if none exists
        const testFarmer = await Farmer.create({
          name: 'Test Farmer',
          phone: '9876543210',
          location: 'Test Location',
          password: 'password123'
        });
        console.log('✅ Test farmer created:', testFarmer.farmer_id);
      } else {
        console.log('✅ Demo data already exists, skipping creation');
      }

      return true;
    } catch (error) {
      console.error('Failed to sync database:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    console.error('Detailed error:', error.original || error);
    process.exit(1);
  }
};

// Start server only after database is synced
// Start server only after database is ready
const startServer = async () => {
  try {
    await syncDatabase();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Note: Database sync is now handled in startServer function
