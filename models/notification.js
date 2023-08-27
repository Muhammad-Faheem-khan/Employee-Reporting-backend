const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: String,
  content: String,
  recipient: mongoose.Schema.Types.ObjectId, // User ID
  read: Boolean,
  task: mongoose.Schema.Types.ObjectId, // Task ID
  announcement: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
