const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  attachmentUrl: { type: String }, // new field
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ channel: 1, createdAt: -1 }); 

module.exports = mongoose.model("Message", MessageSchema);
