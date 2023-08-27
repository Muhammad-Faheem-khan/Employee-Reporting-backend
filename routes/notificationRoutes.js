const express = require('express');
const { createNotification, getUnreadNotifications, markNotificationUnread } = require('../controllers/notificationController');
const {authenticateJWT} = require('../controllers/jwtController')

const router = express.Router();

router.use(authenticateJWT);

router.post('/', createNotification);
router.get('/:id/unread', getUnreadNotifications);
router.patch('/:notificationId/read', markNotificationUnread);

module.exports = router;