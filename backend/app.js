// backend/app.js

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const farmerRoutes = require('./routes/farmers');
const managerRoutes = require('./routes/manager');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/manager', managerRoutes);

// Sync Sequelize models
sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync DB:', err);
});
