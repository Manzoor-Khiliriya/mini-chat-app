class PresenceService {
  constructor() {
    this.channels = {}; // { channelId: { userId: socketCount } }
  }

  ensureBucket(channelId) {
    if (!this.channels[channelId]) this.channels[channelId] = {};
  }

  join(channelId, userId) {
    this.ensureBucket(channelId);
    const prev = this.channels[channelId][userId] || 0;
    this.channels[channelId][userId] = prev + 1;
    return prev === 0; // true → user became online in channel
  }

  leave(channelId, userId) {
    if (!this.channels[channelId] || !this.channels[channelId][userId]) return false;
    this.channels[channelId][userId] -= 1;

    if (this.channels[channelId][userId] <= 0) {
      delete this.channels[channelId][userId];
      if (Object.keys(this.channels[channelId]).length === 0) delete this.channels[channelId];
      return true; // true → user went offline in channel
    }
    return false;
  }

  list(channelId) {
    return Object.keys(this.channels[channelId] || {});
  }

  dump() {
    return this.channels;
  }
}

module.exports = new PresenceService();
