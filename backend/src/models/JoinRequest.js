const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
},
  { timestamps: true }
);

JoinRequestSchema.index({ channel: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', JoinRequestSchema);
