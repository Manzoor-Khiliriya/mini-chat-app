const mongoose = require("mongoose");
const Channel = require("../models/Channel");
const ChannelMember = require("../models/ChannelMember");
const JoinRequest = require("../models/JoinRequest");

// List all channels with membership & pending request info
exports.listChannels = async (req, res) => {
  try {
    const channels = await Channel.find().select("name isPrivate members createdBy");
    const userId = req.user._id.toString();

    const result = await Promise.all(channels.map(async (ch) => {
      const pendingRequest = await JoinRequest.findOne({
        channel: ch._id,
        user: req.user._id,
        status: "pending"
      });

      return {
        id: ch._id,
        name: ch.name,
        isPrivate: ch.isPrivate,
        memberCount: ch.members.length,
        isMember: ch.members.some((m) => m.toString() === userId),
        isOwner: ch.createdBy.toString() === userId,
        requested: !!pendingRequest,   // shows pending request
      };
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// Create channel (public/private)
exports.createChannel = async (req, res) => {
  try {
    const { name, isPrivate } = req.body;
    if (!name) return res.status(400).json({ message: "name required" });

    const ch = await Channel.create({
      name,
      isPrivate: !!isPrivate,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await ChannelMember.create({ channel: ch._id, user: req.user._id, lastReadAt: new Date() });

    res.json({ id: ch._id, name: ch.name, isPrivate: ch.isPrivate });
  } catch (err) {
    console.error("createChannel error", err);
    res.status(500).json({ message: "server error" });
  }
};

exports.getChannelDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid channel ID" });

    const channel = await Channel.findById(id).select("name isPrivate members");
    
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Ensure user is a member to view details (security check)
    if (!channel.members.some(m => m.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: "Not a member of this channel" });
    }

    // Populate member details (username/displayName)
    const channelWithMembers = await Channel.findById(id)
      .select("name members")
      .populate("members", "username displayName");
      
    // Filter the populated member objects to return only necessary fields
    const members = channelWithMembers.members.map(m => ({
        _id: m._id,
        username: m.username,
        displayName: m.displayName
    }));

    res.json({
        id: channel._id,
        name: channel.name,
        members: members,
    });
  } catch (err) {
    console.error("getChannelDetails error", err);
    res.status(500).json({ message: "server error" });
  }
};

// Join channel (public auto join, private request)
exports.requestJoinChannel = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid channel ID" });

    const ch = await Channel.findById(id);
    if (!ch) return res.status(404).json({ message: "channel not found" });

    const userId = req.user._id.toString();

    // already member
    if ((ch.members || []).some(m => m.toString() === userId)) return res.json({ joined: true });

    // Public -> join immediately
    if (!ch.isPrivate) {
      ch.members.push(userId);
      await ch.save();
      await ChannelMember.updateOne(
        { channel: ch._id, user: req.user._id },
        { $setOnInsert: { lastReadAt: new Date(0), joinedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ joined: true });
    }

    // Private -> create join request if none
    const existing = await JoinRequest.findOne({ channel: id, user: userId });
    if (existing) return res.json({ requested: true, status: existing.status });

    await JoinRequest.create({ channel: id, user: userId });
    return res.json({ requested: true });
  } catch (err) {
    console.error("requestJoinChannel error", err);
    res.status(500).json({ message: "server error" });
  }
};

// Leave channel
exports.leaveChannel = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid channel ID" });

    const ch = await Channel.findById(id);
    if (!ch) return res.status(404).json({ message: "channel not found" });

    const userId = req.user._id.toString();

    ch.members = ch.members.filter((m) => m.toString() !== userId);
    await ch.save();

    await ChannelMember.deleteOne({ channel: ch._id, user: req.user._id });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// List join requests for creator/admin
exports.listJoinRequests = async (req, res) => {
  try {
    const { id } = req.params; // channel id
    const ch = await Channel.findById(id);
    if (!ch) return res.status(404).json({ message: "channel not found" });
    if (ch.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: "only creator can view requests" });

    const requests = await JoinRequest.find({ channel: ch._id, status: "pending" }).populate("user", "username");
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// Approve join request
exports.approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const reqObj = await JoinRequest.findById(requestId).populate("channel");
    if (!reqObj) return res.status(404).json({ message: "request not found" });

    if (reqObj.channel.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "only creator can approve" });

    reqObj.status = "approved";
    await reqObj.save();

    const ch = await Channel.findById(reqObj.channel._id);
    ch.members.push(reqObj.user._id);
    await ch.save();
    await ChannelMember.create({ channel: ch._id, user: reqObj.user._id, lastReadAt: new Date() });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// Reject join request
exports.rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const reqObj = await JoinRequest.findById(requestId).populate("channel");
    if (!reqObj) return res.status(404).json({ message: "request not found" });

    if (reqObj.channel.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "only creator can reject" });

    reqObj.status = "rejected";
    await reqObj.save();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};
