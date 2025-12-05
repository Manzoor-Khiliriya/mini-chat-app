const PinnedMessage = require('../models/PinnedMessage');
const Message = require('../models/Message');
const ChannelMember = require('../models/ChannelMember');

exports.pinMessage = async (req, res) => {
  try {
    const { messageId, channelId } = req.body;
    const userId = req.user._id;

    const isMember = await ChannelMember.exists({ channel: channelId, user: userId });
    if (!isMember) return res.status(403).json({ message: 'not a member' });

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    await PinnedMessage.updateOne(
      { message: messageId, channel: channelId },
      { $set: { pinnedBy: userId, pinnedAt: new Date() } },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};

exports.getPinnedMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const isMember = await ChannelMember.exists({ channel: channelId, user: userId });
    if (!isMember) return res.status(403).json({ message: 'not a member' });

    const pinned = await PinnedMessage.find({ channel: channelId })
      .populate('message')
      .populate('pinnedBy', 'username displayName')
      .sort({ pinnedAt: -1 });

    res.json(pinned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
};
