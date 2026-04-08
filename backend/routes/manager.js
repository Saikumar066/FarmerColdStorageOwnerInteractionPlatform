const express = require('express');
const Manager = require('../models/Manager');
const LocationService = require('../services/locationService');
const { generateToken } = require('../utils/jwt');

const router = express.Router();

// Manager Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const manager = await Manager.findOne({ where: { email } });

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (manager.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = generateToken({
      role: 'manager',
      id: manager.id,
      email: manager.email,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      role: 'manager',
      manager: {
        id: manager.id,
        username: manager.username,
        email: manager.email,
        phone: manager.phone,
        city: manager.city,
        latitude: manager.latitude,
        longitude: manager.longitude
      }
    });
  } catch (err) {
    console.error('Manager login error:', err);
    res.status(500).json({ message: 'Server error during manager login' });
  }
});
// Manager Registration Route
router.post('/register', async (req, res) => {
  const { username, email, phone, password, city, latitude, longitude } = req.body;

  try {
    // Check for existing email
    const existingEmail = await Manager.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Check for existing phone
    const existingPhone = await Manager.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number already registered' });
    }

    let managerData = {
      username,
      email,
      phone,
      password,
      city
    };

    // If coordinates are provided, use them directly
    if (latitude && longitude) {
      managerData.latitude = parseFloat(latitude);
      managerData.longitude = parseFloat(longitude);
      console.log('✅ Manager registered with coordinates:', { latitude: managerData.latitude, longitude: managerData.longitude });
    } else {
      // Try to geocode the city
      try {
        const geocoded = await LocationService.geocodeAddress(city);
        managerData.latitude = geocoded.latitude;
        managerData.longitude = geocoded.longitude;
        console.log('✅ Geocoded manager city:', geocoded);
      } catch (geocodeError) {
        console.log('⚠️ Manager geocoding failed, proceeding without coordinates:', geocodeError.message);
        // Continue without coordinates - they can be added later
      }
    }

    // Create manager
    const newManager = await Manager.create(managerData);

    res.status(201).json({
      message: 'Manager registered successfully',
      manager: newManager
    });
  } catch (err) {
    console.error('Error registering manager:', err);
    res.status(500).json({ message: 'Server error during manager registration' });
  }
});




module.exports = router;
