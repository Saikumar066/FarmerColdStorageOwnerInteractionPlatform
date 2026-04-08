const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { Manager, Booking, ColdStorage, Farmer } = require('../models');
const { authenticateToken, authorizeRoles, requireParamOwner } = require('../middleware/auth');

// GET: All notifications for a specific manager
router.get('/manager/:managerId', authenticateToken, authorizeRoles('manager'), requireParamOwner('managerId'), async (req, res) => {
  const { managerId } = req.params;
  
  try {
    // Verify manager exists
    const manager = await Manager.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    const notifications = notificationService.getManagerNotifications(parseInt(managerId));
    const unreadCount = notificationService.getUnreadCount(parseInt(managerId));
    
    res.json({
      notifications,
      unread_count: unreadCount,
      total_count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching manager notifications:', error);
    res.status(500).json({ 
      message: 'Server error while fetching notifications',
      error: error.message 
    });
  }
});

// PUT: Mark notification as read
router.put('/manager/:managerId/:notificationId/read', authenticateToken, authorizeRoles('manager'), requireParamOwner('managerId'), async (req, res) => {
  const { managerId, notificationId } = req.params;
  
  try {
    // Verify manager exists
    const manager = await Manager.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    const success = notificationService.markNotificationAsRead(
      parseInt(managerId), 
      notificationId
    );
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      message: 'Server error while updating notification',
      error: error.message 
    });
  }
});

// GET: Unread notification count for a manager
router.get('/manager/:managerId/unread-count', authenticateToken, authorizeRoles('manager'), requireParamOwner('managerId'), async (req, res) => {
  const { managerId } = req.params;
  
  try {
    // Verify manager exists
    const manager = await Manager.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    const unreadCount = notificationService.getUnreadCount(parseInt(managerId));
    
    res.json({ unread_count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      message: 'Server error while fetching unread count',
      error: error.message 
    });
  }
});

// DELETE: Clear all notifications for a manager (for testing)
router.delete('/manager/:managerId', authenticateToken, authorizeRoles('manager'), requireParamOwner('managerId'), async (req, res) => {
  const { managerId } = req.params;
  
  try {
    // Verify manager exists
    const manager = await Manager.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    notificationService.clearManagerNotifications(parseInt(managerId));
    
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ 
      message: 'Server error while clearing notifications',
      error: error.message 
    });
  }
});

// PUT: Confirm booking (Manager accepts the booking)
router.put('/manager/:managerId/booking/:bookingId/confirm', authenticateToken, authorizeRoles('manager'), requireParamOwner('managerId'), async (req, res) => {
  const { managerId, bookingId } = req.params;
  
  try {
    // Verify manager exists
    const manager = await Manager.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Find and verify the booking
    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: ColdStorage,
        as: 'cold_storage',
        where: { manager_id: managerId }
      }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not managed by this manager' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    // Update booking status to confirmed
    await booking.update({ status: 'confirmed' });

    // Update storage status to booked
    await ColdStorage.update(
      { status: 'booked' },
      { where: { storage_id: booking.storage_id } }
    );

    // Update notification status
    notificationService.updateNotificationStatus(parseInt(managerId), parseInt(bookingId), 'confirmed');

    console.log(`✅ Booking ${bookingId} confirmed by manager ${managerId}`);
    
    res.json({ 
      message: 'Booking confirmed successfully',
      booking: {
        booking_id: booking.booking_id,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ 
      message: 'Server error while confirming booking',
      error: error.message 
    });
  }
});

// PUT: Reject booking (Manager rejects the booking)
router.put('/manager/:managerId/booking/:bookingId/reject', authenticateToken, authorizeRoles('manager'), requireParamOwner('managerId'), async (req, res) => {
  const { managerId, bookingId } = req.params;
  const { reason } = req.body; // Optional rejection reason
  
  try {
    // Verify manager exists
    const manager = await Manager.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Find and verify the booking
    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: ColdStorage,
        as: 'cold_storage',
        where: { manager_id: managerId }
      }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not managed by this manager' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    // Update booking status to cancelled with reason
    const updateData = { status: 'cancelled' };
    if (reason) {
      updateData.notes = booking.notes ? `${booking.notes}\n\nRejection reason: ${reason}` : `Rejection reason: ${reason}`;
    }
    
    await booking.update(updateData);

    // Keep storage status as vacant since booking was rejected
    await ColdStorage.update(
      { status: 'vacant' },
      { where: { storage_id: booking.storage_id } }
    );

    // Update notification status
    notificationService.updateNotificationStatus(parseInt(managerId), parseInt(bookingId), 'rejected');

    console.log(`❌ Booking ${bookingId} rejected by manager ${managerId}`);
    
    res.json({ 
      message: 'Booking rejected successfully',
      booking: {
        booking_id: booking.booking_id,
        status: booking.status,
        rejection_reason: reason
      }
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ 
      message: 'Server error while rejecting booking',
      error: error.message 
    });
  }
});

module.exports = router;
