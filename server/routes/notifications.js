const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controller/notification.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.patch('/read', protect, markAsRead);

module.exports = router;
