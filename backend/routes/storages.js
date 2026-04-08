
const express = require('express');
const router = express.Router();
const ColdStorage = require('../models/ColdStorage');
const LocationService = require('../services/locationService');
const { authenticateToken, authorizeRoles, requireParamOwner, requireBodyOwner } = require('../middleware/auth');

// GET: Single cold storage by ID
router.get('/:id', async (req, res) => {
  try {
    const storage = await ColdStorage.findByPk(req.params.id);
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' });
    }
    res.status(200).json(storage);
  } catch (error) {
    console.error('Error fetching storage by ID:', error);
    res.status(500).json({ message: 'Server error while fetching storage' });
  }
});

// GET: All cold storages (for Dashboard) with distance calculation
router.get('/', async (req, res) => {
  try {
    const { farmer_lat, farmer_lng } = req.query;
    const storages = await ColdStorage.findAll({ order: [['created_at', 'DESC']] });
    
    // If farmer coordinates are provided, calculate distances
    if (farmer_lat && farmer_lng) {
      const storagesWithDistance = storages.map(storage => {
        let distance = null;
        if (storage.latitude && storage.longitude) {
          distance = LocationService.calculateDistance(
            parseFloat(farmer_lat),
            parseFloat(farmer_lng),
            parseFloat(storage.latitude),
            parseFloat(storage.longitude)
          );
        }
        
        return {
          ...storage.toJSON(),
          distance: distance ? `${distance} km` : 'N/A'
        };
      });
      
      // Sort by distance (closest first)
      storagesWithDistance.sort((a, b) => {
        if (a.distance === 'N/A') return 1;
        if (b.distance === 'N/A') return -1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });
      
      res.status(200).json(storagesWithDistance);
    } else {
      res.status(200).json(storages.map(s => ({ ...s.toJSON(), distance: 'N/A' })));
    }
  } catch (error) {
    console.error('Error fetching all storages:', error);
    res.status(500).json({ message: 'Server error while fetching all storages' });
  }
});

// ✅ GET: All cold storages for a manager
router.get('/manager/:managerId', authenticateToken, authorizeRoles('manager'), requireParamOwner('managerId'), async (req, res) => {
  const { managerId } = req.params;

  try {
    const storages = await ColdStorage.findAll({
      where: { manager_id: managerId },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json(storages);
  } catch (error) {
    console.error('Error fetching storages:', error);
    res.status(500).json({ message: 'Server error while fetching storages' });
  }
});

// ✅ PATCH: Update cold storage status
router.patch('/:id/status', authenticateToken, authorizeRoles('manager'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const storage = await ColdStorage.findByPk(id);
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' });
    }

    if (Number(storage.manager_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden: you cannot update this storage' });
    }

    storage.status = status;
    await storage.save();

    res.status(200).json({ message: 'Status updated successfully', storage });
  } catch (err) {
    console.error('Error updating storage status:', err);
    res.status(500).json({ message: 'Server error while updating status' });
  }
});

// ✅ POST: Manager adds a new cold storage
router.post('/', authenticateToken, authorizeRoles('manager'), requireBodyOwner('manager_id'), async (req, res) => {
  try {
    const {
      name,
      location,
      temperature,
      capacity,
      cost_per_day,
      type,
      manager_id,
      latitude,
      longitude
    } = req.body;

    if (!manager_id) {
      return res.status(400).json({ error: 'manager_id is required' });
    }
    if (!type) {
      return res.status(400).json({ error: 'type is required' });
    }

    let storageData = {
      name,
      location,
      temperature,
      capacity,
      cost_per_day,
      type,
      manager_id,
    };

    // If coordinates are provided, use them directly
    if (latitude && longitude) {
      storageData.latitude = parseFloat(latitude);
      storageData.longitude = parseFloat(longitude);
    } else {
      // Try to geocode the location
      try {
        const geocoded = await LocationService.geocodeAddress(location);
        storageData.latitude = geocoded.latitude;
        storageData.longitude = geocoded.longitude;
        console.log('✅ Geocoded storage location:', geocoded);
      } catch (geocodeError) {
        console.log('⚠️ Storage geocoding failed, proceeding without coordinates:', geocodeError.message);
      }
    }

    const storage = await ColdStorage.create(storageData);

    res.status(201).json({ message: '✅ Cold storage created!', data: storage });
  } catch (error) {
    console.error('❌ Error inserting cold storage:', error.message);
    res.status(500).json({ error: 'Failed to create cold storage' });
  }
});

module.exports = router;
