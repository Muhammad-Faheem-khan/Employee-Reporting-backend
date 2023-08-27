const express = require('express');
const {  getUnreadNotifications, markNotificationUnread } = require('../controllers/notificationController');
const {authenticateJWT} = require('../controllers/jwtController')

const router = express.Router();

router.use(authenticateJWT);

router.get('/:id/unread', getUnreadNotifications);
router.patch('/:notificationId/read', markNotificationUnread);

module.exports = router;