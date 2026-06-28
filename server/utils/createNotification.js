// server/utils/createNotification.js
const Notification = require('../models/Notification');
const User         = require('../models/User');
const sendEmail    = require('./sendEmail');

const createNotification = async ({ recipient, type, message, relatedEntityType, relatedEntityId, sendEmail: doEmail = false }) => {
  try {
    await Notification.create({ recipient, type, message, relatedEntityType, relatedEntityId, channel: 'Dashboard' });
    if (doEmail) {
      const user = await User.findById(recipient).select('email');
      if (user?.email) await sendEmail({ to: user.email, type, message });
    }
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
};

module.exports = createNotification;
