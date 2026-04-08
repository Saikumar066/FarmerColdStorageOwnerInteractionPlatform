const { Manager, ColdStorage, Farmer } = require('../models');

class NotificationService {
  constructor() {
    // In-memory storage for manager notifications
    // In a production app, you'd use Redis, database, or a message queue
    this.managerNotifications = new Map();
  }

  /**
   * Send booking confirmation to the respective cold storage manager
   * @param {Object} booking - The booking details
   * @param {Object} farmer - The farmer who made the booking
   * @param {Object} storage - The cold storage being booked
   */
  async sendBookingConfirmationToManager(booking, farmer, storage) {
    try {
      console.log('📧 Sending booking confirmation to manager...');
      
      // Find the manager for this storage
      const manager = await Manager.findByPk(storage.manager_id);
      
      if (!manager) {
        console.error('❌ Manager not found for storage:', storage.storage_id);
        return { success: false, error: 'Manager not found' };
      }

      // Create notification message
      const notification = {
        id: `booking_${booking.booking_id}_${Date.now()}`,
        type: 'booking_confirmation',
        title: 'New Booking Request',
        message: `New booking request from ${farmer.name} for ${storage.name}`,
        details: {
          booking_id: booking.booking_id,
          booking_status: booking.status,
          farmer: {
            name: farmer.name,
            phone: farmer.phone,
            location: farmer.location
          },
          storage: {
            name: storage.name,
            location: storage.location
          },
          booking: {
            start_time: booking.start_time,
            end_time: booking.end_time,
            quantity: booking.quantity,
            produce: booking.produce,
            notes: booking.notes,
            total_cost: this.calculateTotalCost(booking.start_time, booking.end_time, storage.cost_per_day)
          }
        },
        timestamp: new Date().toISOString(),
        read: false,
        actionable: booking.status === 'pending' // Can take action only if pending
      };

      // Store notification for the manager
      if (!this.managerNotifications.has(manager.id)) {
        this.managerNotifications.set(manager.id, []);
      }
      
      const managerNotifications = this.managerNotifications.get(manager.id);
      managerNotifications.unshift(notification); // Add to beginning for latest first
      
      // Keep only last 50 notifications per manager
      if (managerNotifications.length > 50) {
        managerNotifications.splice(50);
      }

      console.log('✅ Notification sent to manager:', {
        manager_id: manager.id,
        manager_name: manager.username,
        notification_id: notification.id
      });

      return { 
        success: true, 
        notification_id: notification.id,
        manager: {
          id: manager.id,
          name: manager.username,
          email: manager.email
        }
      };

    } catch (error) {
      console.error('❌ Error sending notification to manager:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all notifications for a manager
   * @param {number} managerId - The manager's ID
   * @returns {Array} Array of notifications
   */
  getManagerNotifications(managerId) {
    return this.managerNotifications.get(managerId) || [];
  }

  /**
   * Mark a notification as read
   * @param {number} managerId - The manager's ID
   * @param {string} notificationId - The notification ID
   */
  markNotificationAsRead(managerId, notificationId) {
    const notifications = this.managerNotifications.get(managerId);
    if (notifications) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Get unread notification count for a manager
   * @param {number} managerId - The manager's ID
   * @returns {number} Count of unread notifications
   */
  getUnreadCount(managerId) {
    const notifications = this.managerNotifications.get(managerId) || [];
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Calculate total cost for a booking
   * @param {Date} startTime - Booking start time
   * @param {Date} endTime - Booking end time
   * @param {number} costPerDay - Cost per day for the storage
   * @returns {number} Total cost
   */
  calculateTotalCost(startTime, endTime, costPerDay) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * costPerDay;
  }

  /**
   * Clear all notifications for a manager (useful for testing)
   * @param {number} managerId - The manager's ID
   */
  clearManagerNotifications(managerId) {
    this.managerNotifications.delete(managerId);
  }

  /**
   * Update notification when booking action is taken
   * @param {number} managerId - The manager's ID
   * @param {number} bookingId - The booking ID
   * @param {string} action - The action taken ('confirmed' or 'rejected')
   */
  updateNotificationStatus(managerId, bookingId, action) {
    const notifications = this.managerNotifications.get(managerId);
    if (notifications) {
      const notification = notifications.find(n => n.details.booking_id === bookingId);
      if (notification) {
        notification.actionable = false;
        notification.details.booking_status = action === 'confirmed' ? 'confirmed' : 'cancelled';
        notification.title = action === 'confirmed' ? 'Booking Confirmed' : 'Booking Rejected';
        notification.message = `You have ${action} the booking from ${notification.details.farmer.name}`;
        notification.read = true; // Mark as read since action was taken
        return true;
      }
    }
    return false;
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
