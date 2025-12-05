const User = require('../models/User');

async function setLastSeen(userId, when = new Date()) {
  if (!userId) return null;
  try {
    return await User.findByIdAndUpdate(
      userId,
      { lastSeen: when },
      { new: true }
    ).select('lastSeen');
  } catch (err) {
    console.error('setLastSeen error', err);
    return null;
  }
}

async function getLastSeen(userId) {
  if (!userId) return null;
  try {
    const user = await User.findById(userId).select('lastSeen');
    return user?.lastSeen || null;
  } catch (err) {
    console.error('getLastSeen error', err);
    return null;
  }
}

module.exports = { setLastSeen, getLastSeen };
