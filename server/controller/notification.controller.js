const Notification = require('../models/notification.model');

exports.createNotification = async (recipient, message, link) => {
  try {
    const notification = new Notification({ recipient, message, link });
    await notification.save();

    // Emit a real-time event to the specific user
    const io = require('../socket').getIO();
    io.to(recipient.toString()).emit('newNotification', notification);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.status(200).json({ message: 'Notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications as read.' });
  }
};
