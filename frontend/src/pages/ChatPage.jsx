import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { getMessages } from "../api/messageApi";
import { getChannelDetails, getChannels } from "../api/channelApi";
import MessageItem from "../components/MessageItem";
import TypingIndicator from "../components/TypingIndicator";
import ChannelSidebar from "../components/ChannelSidebar";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { Send, ChevronUp } from "lucide-react";

export default function ChatPage() {
  const { channelId } = useParams();
  const { socket, onlineUsers, typingUsers, joinChannel, leaveChannel, typingHandler } =
    useContext(ChatContext);
  const { user } = useContext(AuthContext);

  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [before, setBefore] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState("");
  const [channelDetails, setChannelDetails] = useState({ name: null, members: [] });
  const messagesEndRef = useRef();

  // --- Fetch channel list for sidebar
  useEffect(() => {
    const fetchChannelList = async () => {
      try {
        const list = await getChannels();
        setChannels(list);
      } catch (e) {
        console.error("Failed to fetch channels", e);
      }
    };
    fetchChannelList();
  }, []);

  // --- Channel details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await getChannelDetails(channelId);
        setChannelDetails(details);
      } catch (e) {
        console.error("Error fetching channel details:", e);
        setChannelDetails({ name: "Unknown Channel", members: [] });
      }
    };
    fetchDetails();
  }, [channelId]);

  // --- Join channel and handle socket messages
  useEffect(() => {
    joinChannel(channelId);
    socket?.on("message", handleNewMessage);

    return () => {
      leaveChannel(channelId);
      socket?.off("message", handleNewMessage);
    };
  }, [channelId, socket]);

  // --- Load initial messages
  useEffect(() => {
    loadInitial();
  }, [channelId]);

  const handleNewMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
    const container = document.getElementById("messages-container");
    if (container.scrollHeight - container.scrollTop < container.clientHeight + 100) {
      scrollToBottom("smooth");
    }
  };

  const loadInitial = async () => {
    setLoadingMore(true);
    try {
      setMessages([]);
      const res = await getMessages(channelId, 10, null);
      setMessages(res.messages || []);
      setHasMore(res.hasMore);
      if (res.messages?.length) setBefore(res.messages[0].createdAt);
      scrollToBottom("auto");
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  const loadOlder = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const container = document.getElementById("messages-container");
    const oldScrollHeight = container.scrollHeight;

    try {
      const res = await getMessages(channelId, 30, before);
      if (res.messages?.length) {
        setMessages((prev) => [...res.messages, ...prev]);
        setBefore(res.messages[0].createdAt);

        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
        });
      }
      setHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  const scrollToBottom = (behavior = "smooth") =>
    messagesEndRef.current?.scrollIntoView({ behavior });

  const send = () => {
    if (!text.trim()) return;
    socket?.emit("send_message", { channelId, content: text });
    setText("");
    typingHandler(channelId, false);
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    const wasTyping = text.length > 0;
    const isTypingNow = value.length > 0;
    if (wasTyping !== isTypingNow) typingHandler(channelId, isTypingNow);
    setText(value);
  };

  // --- Online users display
  const currentTypingUsers = typingUsers[channelId] || [];
  const currentOnlineUsers = onlineUsers[channelId] || [];
  const onlineUserNames = currentOnlineUsers
    .map((uid) => channelDetails.members.find((m) => m._id === uid)?.username)
    .filter(Boolean)
    .filter((name) => name !== user?.username);

  const onlineDisplay =
    onlineUserNames.length === 0
      ? "You are the only one online."
      : onlineUserNames.length <= 3
      ? `${onlineUserNames.length} online: ${onlineUserNames.join(", ")}`
      : `${currentOnlineUsers.length} online (incl. ${onlineUserNames[0]}, ${onlineUserNames[1]} and others)`;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* Chat area */}
      <div className="flex-1 flex flex-col p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold">{channelDetails.name || channelId}</h2>
          <span
            className="text-sm text-gray-600 dark:text-gray-400 font-medium"
            title={onlineDisplay}
          >
            {onlineDisplay}
          </span>
        </div>

        <TypingIndicator users={currentTypingUsers} />

        <div
          id="messages-container"
          className="flex-1 rounded-lg p-4 overflow-y-auto space-y-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner"
        >
          {hasMore && (
            <div className="flex justify-center mb-4">
              <button
                onClick={loadOlder}
                disabled={loadingMore}
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
              >
                <ChevronUp size={18} />
                {loadingMore ? "Loading..." : "Load older messages"}
              </button>
            </div>
          )}

          {messages.map((m) => (
            <MessageItem key={m._id} msg={m} isOwn={m.sender?._id === user?._id} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your message"
            className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="p-3 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
