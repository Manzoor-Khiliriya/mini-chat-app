// backend/src/sockets/index.js
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const ChannelMember = require("../models/ChannelMember");
const { default: mongoose } = require("mongoose");
const presenceService = require("../services/presenceService");
const lastSeenService = require("../services/lastSeenService");

function parseTokenFromCookie(cookieHeader = "") {
  try {
    const parts = cookieHeader.split(";").map(p => p.trim());
    for (const p of parts) {
      if (p.startsWith("token=")) return p.split("=")[1];
    }
  } catch { }
  return null;
}

module.exports = function (io) {
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers?.cookie || "";
      const cookieToken = parseTokenFromCookie(cookieHeader);
      const token = cookieToken || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication error"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id, username: payload.username };
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    lastSeenService.setLastSeen(socket.user.id);

    socket.on("join_channel", async ({ channelId }) => {
      if (!channelId) return;
      if (!mongoose.Types.ObjectId.isValid(channelId)) return;
      const room = `channel:${channelId}`;
      await socket.join(room);
      presenceService.join(channelId, socket.user.id);
      lastSeenService.setLastSeen(socket.user.id);
      const onlineUsers = presenceService.list(channelId);
      io.to(room).emit("presence_update", { channelId, onlineUsers });
      io.to(room).emit("user_joined", { channelId, userId: socket.user.id, username: socket.user.username });

      let member = await ChannelMember.findOne({ channel: channelId, user: socket.user.id });
      if (!member) {
        member = await ChannelMember.create({ channel: channelId, user: socket.user.id, lastReadAt: new Date(0) });
      }

      const lastRead = member.lastReadAt || new Date(0);
      const unreadCount = await Message.countDocuments({ channel: channelId, createdAt: { $gt: lastRead } });

      const unreadMessages = await Message.find({ channel: channelId, createdAt: { $gt: lastRead } })
        .sort({ createdAt: 1 })
        .limit(100)
        .populate('sender', 'username displayName');

      socket.emit('unread_count', { channelId, unreadCount });
      if (unreadCount > 0) socket.emit('unread_messages', { channelId, messages: unreadMessages });
    });

    socket.on("leave_channel", ({ channelId }) => {
      if (!channelId) return;
      const room = `channel:${channelId}`;
      socket.leave(room);
      presenceService.leave(channelId, socket.user.id);
      lastSeenService.setLastSeen(socket.user.id);
      const onlineUsers = presenceService.list(channelId);
      io.to(room).emit("presence_update", { channelId, onlineUsers });
      io.to(room).emit("user_left", { channelId, userId: socket.user.id, username: socket.user.username });
    });

    socket.on("send_message", async ({ channelId, content }) => {
      if (!channelId || !content || !content.trim()) {
        socket.emit("error", { code: "invalid_payload" });
        return;
      }
      lastSeenService.setLastSeen(socket.user.id);
      const msgDoc = await Message.create({
        channel: channelId,
        sender: socket.user.id,
        content: content.trim()
      });
      const populated = await msgDoc.populate("sender", "username displayName");
      const room = `channel:${channelId}`;
      io.to(room).emit("message", populated);
      socket.emit("message_sent", { messageId: populated._id, channelId, createdAt: populated.createdAt });
    });

    socket.on("typing", ({ channelId, isTyping }) => {
      if (!channelId) return;
      const room = `channel:${channelId}`;
      socket.to(room).emit("user_typing", {
        channelId,
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: !!isTyping
      });
    });

    socket.on("disconnecting", () => {
      const rooms = Array.from(socket.rooms).filter(r => r.startsWith("channel:"));
      rooms.forEach((room) => {
        const channelId = room.split(":")[1];
        presenceService.leave(channelId, socket.user.id);
        const onlineUsers = presenceService.list(channelId);
        io.to(room).emit("presence_update", { channelId, onlineUsers });
        io.to(room).emit("user_left", { channelId, userId: socket.user.id, username: socket.user.username });
      });
      lastSeenService.setLastSeen(socket.user.id);
    });

    socket.on("mark_read", async ({ channelId }) => {
      const userId = socket.user.id;

      await ChannelMember.updateOne(
        { channel: channelId, user: userId },
        { lastReadAt: new Date() },
        { upsert: true }
      );

      io.to(`channel:${channelId}`).emit("messages_read", {
        channelId,
        userId,
      });
    });


    socket.on("disconnect", () => {
      lastSeenService.setLastSeen(socket.user.id);
    });
  });
};
