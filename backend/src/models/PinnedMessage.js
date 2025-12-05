const mongoose = require("mongoose");

const PinnedMessageSchema = new mongoose.Schema({
  message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pinnedAt: { type: Date, default: Date.now }
});

PinnedMessageSchema.index({ message: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model("PinnedMessage", PinnedMessageSchema);
