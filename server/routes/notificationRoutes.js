// server/routes/notificationRoutes.js
const express = require('express');
const { getNotifications, getUnreadCount, getLatestUnread, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// static routes before /:id
router.get('/unread-count', getUnreadCount);
router.get('/latest',       getLatestUnread);
router.put('/read-all',     markAllAsRead);

router.get('/',             getNotifications);
router.put('/:id/read',     markAsRead);
router.delete('/:id',       deleteNotification);

module.exports = router;
