// server/controllers/notificationController.js
const Notification = require('../models/Notification');

const send = (res, status, success, data, message) =>
  res.status(status).json({ success, data, message, error: null });

// ── GET /api/v1/notifications?page&limit&readFilter ────────
// readFilter: '' (all) | 'unread' | 'read'
const getNotifications = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { recipient: req.user._id };

    if (req.query.readFilter === 'unread') filter.read = false;
    if (req.query.readFilter === 'read')   filter.read = true;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Notification.countDocuments(filter)
    ]);
    send(res, 200, true, { notifications, total, page, pages: Math.ceil(total / limit) }, 'Notifications fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/notifications/unread-count ─────────────────
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    send(res, 200, true, { count }, 'Unread count fetched');
  } catch (e) { next(e); }
};

// ── GET /api/v1/notifications/latest ──────────────────────
// Used by NotificationBell dropdown (default limit 5)
const getLatestUnread = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const notifications = await Notification.find({ recipient: req.user._id, read: false })
      .sort({ createdAt: -1 })
      .limit(limit);
    send(res, 200, true, { notifications }, 'Latest unread fetched');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/notifications/:id/read ────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return send(res, 404, false, null, 'Notification not found');
    send(res, 200, true, { notification }, 'Marked as read');
  } catch (e) { next(e); }
};

// ── PUT /api/v1/notifications/read-all ────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    send(res, 200, true, null, 'All notifications marked as read');
  } catch (e) { next(e); }
};

// ── DELETE /api/v1/notifications/:id ──────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    if (!notification) return send(res, 404, false, null, 'Notification not found');
    send(res, 200, true, null, 'Notification deleted');
  } catch (e) { next(e); }
};

module.exports = { getNotifications, getUnreadCount, getLatestUnread, markAsRead, markAllAsRead, deleteNotification };
