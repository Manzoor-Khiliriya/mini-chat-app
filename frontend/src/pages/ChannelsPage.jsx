import React, { useState, useEffect, useContext } from "react";
import ChannelSidebar from "../components/ChannelSidebar";
import { Plus, Lock, Hash, Loader2 } from "lucide-react";
import {
  getChannels,
  createChannel,
  requestJoinChannel,
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  leaveChannel,
} from "../api/channelApi";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRequestChannel, setActiveRequestChannel] = useState(null);
  const [createError, setCreateError] = useState("");

  const { currentChannel, setCurrentChannel } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchChannels();
  }, [user]);

  const fetchChannels = async () => {
    try {
      const data = await getChannels();
      setChannels(data);
    } catch {
      console.error("Channel fetch failed");
    }
  };

  const selectChannel = (ch) => {
    setCurrentChannel(ch);
    navigate(`/chat/${ch.id}`);
  };

  const handleJoin = async (ch) => {
    setJoiningId(ch.id);
    try {
      const res = await requestJoinChannel(ch.id);

      setChannels((prev) =>
        prev.map((c) =>
          c.id === ch.id
            ? {
                ...c,
                isMember: res.joined || c.isMember,
                requested: res.requested,
              }
            : c
        )
      );

      if (res.joined) selectChannel(ch);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (ch) => {
    await leaveChannel(ch.id);
    if (currentChannel?.id === ch.id) setCurrentChannel(null);
    fetchChannels();
  };

  const createNew = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      await createChannel({ name, isPrivate });
      setName("");
      setIsPrivate(false);
      fetchChannels();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Create failed");
    } finally {
      setIsCreating(false);
    }
  };

  const onViewRequests = async (channelId) => {
    setActiveRequestChannel(channelId);
    const res = await listJoinRequests(channelId);
    setPendingRequests(res.requests || []);
  };

  const handleApprove = async (id) => {
    await approveJoinRequest(id);
    onViewRequests(activeRequestChannel);
    fetchChannels();
  };

  const handleReject = async (id) => {
    await rejectJoinRequest(id);
    onViewRequests(activeRequestChannel);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ChannelSidebar
        channels={channels}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onSelect={selectChannel}
        onViewRequests={onViewRequests}
        joiningId={joiningId}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Create Channel */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
          <h2 className="font-bold text-lg mb-3">Create New Channel</h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Channel name"
            className="w-full p-2 rounded bg-white dark:bg-gray-700 border mb-3"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            {isPrivate ? (
              <>
                <Lock size={14} /> Private (requires approval)
              </>
            ) : (
              <>
                <Hash size={14} /> Public (open to all)
              </>
            )}
          </label>

          <button
            onClick={createNew}
            disabled={!name.trim() || isCreating}
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded flex items-center justify-center gap-2"
          >
            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>

        {/* Requests */}
        <h2 className="text-xl font-semibold mb-4 p-4">Pending Requests</h2>
        {pendingRequests.map((req) => (
          <div key={req._id} className="flex justify-between p-3 border rounded mb-2">
            <span>{req.user.username}</span>
            <div className="flex gap-2">
              <button onClick={() => handleApprove(req._id)} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
              <button onClick={() => handleReject(req._id)} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
