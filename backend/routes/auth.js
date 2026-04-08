const express = require('express');
const router = express.Router();
const { Farmer } = require('../models');
const { generateToken } = require('../utils/jwt');

// Register Farmer
router.post('/register', async (req, res) => {
  const { name, phone, location } = req.body;

  try {
    const exists = await Farmer.findOne({ where: { phone } });
    if (exists) {
      return res.status(400).json({ message: 'Farmer already registered' });
    }

    const newFarmer = await Farmer.create({ name, phone, location });
    res.status(201).json({ message: 'Registration successful', farmer: newFarmer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Farmer
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const farmer = await Farmer.findOne({ where: { phone } });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found. Please register.' });
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

    res.status(200).json({
      message: 'Login successful',
      token,
      role: 'farmer',
      farmer: farmerData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
