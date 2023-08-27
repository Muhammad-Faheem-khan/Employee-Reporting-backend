const Notification = require('../models/notification');

// Create a notification

exports.createNotification = async (req, res) => {
    try {
        const newNotification = await Notification.create(req.body);
        res.status(201).json(newNotification);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }
  };


// Fetch unread notifications for a user
exports.getUnreadNotifications =  async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.params.userId,
      read: false,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}

// Mark a notification as read
exports.markNotificationUnread =  async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

