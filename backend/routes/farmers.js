// backend/routes/farmers.js

const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const LocationService = require('../services/locationService');
const { generateToken } = require('../utils/jwt');

// Register farmer
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Farmer registration request received:', req.body);
    const { name, phone, location, password, latitude, longitude } = req.body;
    
    console.log('📋 Extracted fields:', { name, phone, location, password, latitude, longitude });
    
    const existingFarmer = await Farmer.findOne({ where: { phone } });
    if (existingFarmer) {
      console.log('❌ Farmer already exists with phone:', phone);
      return res.status(400).json({ message: 'Farmer already exists with this phone number' });
    }

    if (!name || !phone || !location || !password) {
      console.log('❌ Missing required fields:', { name: !!name, phone: !!phone, location: !!location, password: !!password });
      return res.status(400).json({ message: 'All fields (name, phone, location, password) are required' });
    }

    let farmerData = { name, phone, location, password };

    // If coordinates are provided, use them directly
    if (latitude && longitude) {
      farmerData.latitude = parseFloat(latitude);
      farmerData.longitude = parseFloat(longitude);
      console.log('✅ Using provided coordinates:', { latitude: farmerData.latitude, longitude: farmerData.longitude });
    } else {
      // Try to geocode the location
      try {
        const geocoded = await LocationService.geocodeAddress(location);
        farmerData.latitude = geocoded.latitude;
        farmerData.longitude = geocoded.longitude;
        console.log('✅ Geocoded location:', geocoded);
      } catch (geocodeError) {
        console.log('⚠️ Geocoding failed, proceeding without coordinates:', geocodeError.message);
        // Continue without coordinates - they can be added later
      }
    }

    const newFarmer = await Farmer.create(farmerData);
    const token = generateToken({
      role: 'farmer',
      id: newFarmer.farmer_id,
      phone: newFarmer.phone,
    });

    const farmerResponse = {
      farmer_id: newFarmer.farmer_id,
      name: newFarmer.name,
      phone: newFarmer.phone,
      location: newFarmer.location,
      latitude: newFarmer.latitude,
      longitude: newFarmer.longitude,
      createdAt: newFarmer.createdAt,
      updatedAt: newFarmer.updatedAt,
    };

    console.log('✅ Farmer created successfully:', newFarmer.farmer_id);
    res.status(201).json({
      message: 'Farmer registered successfully',
      token,
      role: 'farmer',
      farmer: farmerResponse,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Failed to register farmer' });
  }
});

// Login farmer
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const farmer = await Farmer.findOne({ where: { phone } });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    if (!password || farmer.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      role: 'farmer',
      id: farmer.farmer_id,
      phone: farmer.phone,
    });

    const farmerData = {
      farmer_id: farmer.farmer_id,
      name: farmer.name,
      phone: farmer.phone,
      location: farmer.location,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
      createdAt: farmer.createdAt,
      updatedAt: farmer.updatedAt,
    };

    res.status(200).json({ message: 'Login successful', token, role: 'farmer', farmer: farmerData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Failed to login' });
  }
});

module.exports = router;
