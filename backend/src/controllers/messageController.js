const mongoose = require('mongoose');
const ChannelMember = require('../models/ChannelMember');
const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Invalid channel ID' });
    }

    const isMember = await ChannelMember.exists({ channel: channelId, user: userId });
    if (!isMember) return res.status(403).json({ message: 'not a member' });

    const limit = Math.min(parseInt(req.query.limit || '30', 10), 100);
    const before = req.query.before ? new Date(req.query.before) : null;

    const query = { channel: channelId };
    if (before) query.createdAt = { $lt: before };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username displayName');

    res.json({ messages: messages.reverse(), hasMore: messages.length === limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: 'Invalid channel ID' });
    }

    const member = await ChannelMember.findOneAndUpdate(
      { channel: channelId, user: userId },
      { lastReadAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true, lastReadAt: member.lastReadAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};
