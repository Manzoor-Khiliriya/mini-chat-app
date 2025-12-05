const mongoose = require('mongoose');

const channelMemberSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  joinedAt: { type: Date, default: Date.now },
  lastReadAt: { type: Date, default: null }
});


channelMemberSchema.index({ channel: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ChannelMember', channelMemberSchema);
