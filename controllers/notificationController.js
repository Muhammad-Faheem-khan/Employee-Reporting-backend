const Notification = require('../models/notification');

// Fetch unread notifications for a user
exports.getUnreadNotifications =  async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      read: false,
    }).sort({ createdAt: -1 }) // Sort by createdAt field in descending order (newest first)
    .exec();

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

