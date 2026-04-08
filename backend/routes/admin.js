const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Farmer = require('../models/Farmer');
const Manager = require('../models/Manager');
const { generateToken } = require('../utils/jwt');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Admin Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      role: 'admin',
      id: admin.id,
      username: admin.username,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      role: 'admin',
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Dashboard Stats Route
router.get('/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const farmerCount = await Farmer.count();
    const managerCount = await Manager.count();
    res.status(200).json({ farmers: farmerCount, managers: managerCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
