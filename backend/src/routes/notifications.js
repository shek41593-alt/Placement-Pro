const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount, createNotification, getBroadcastHistory, purgeNotifications } = require('../controllers/notificationsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', authenticate, getMyNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/broadcasts', authenticate, authorize('tpo'), getBroadcastHistory);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/mark-all-read', authenticate, markAllAsRead);
router.delete('/purge-read', authenticate, purgeNotifications);
router.post('/', authenticate, authorize('tpo'), createNotification);

module.exports = router;
