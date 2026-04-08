const express = require('express');
const router = express.Router();
const ColdStorage = require('../models/ColdStorage');

// ✅ GET: All cold storages for a manager
router.get('/manager/:managerId', async (req, res) => {
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
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const storage = await ColdStorage.findByPk(id);
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' });
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
router.post('/', async (req, res) => {
  try {
    const {
      name,
      location,
      temperature,
      capacity,
      cost_per_day,
      features,
      manager_id,
      type,
    } = req.body;

    if (!manager_id || !type) {
      return res.status(400).json({ error: 'manager_id and type are required' });
    }

    const storage = await ColdStorage.create({
      name,
      location,
      temperature,
      capacity,
      cost_per_day,
      features: Array.isArray(features) ? features.join(', ') : features,
      manager_id,
      type,
    });

    res.status(201).json({ message: '✅ Cold storage created!', data: storage });
  } catch (error) {
    console.error('❌ Error inserting cold storage:', error.message);
    res.status(500).json({ error: 'Failed to create cold storage' });
  }
});

module.exports = router;
