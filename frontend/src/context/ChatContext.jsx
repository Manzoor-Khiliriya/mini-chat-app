// ===================================
// IN YOUR ChatContext.js FILE
// ===================================
import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import { initSocket, disconnectSocket } from "../sockets/socket";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [currentChannel, setCurrentChannel] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = initSocket();

    socketRef.current.on("connect", () => console.log("Socket connected"));

    socketRef.current.on("presence_update", ({ channelId, onlineUsers }) => {
      setOnlineUsers(prev => ({ ...prev, [channelId]: onlineUsers }));
    });

    socketRef.current.on("user_typing", ({ channelId, username, isTyping }) => {
      setTypingUsers(prev => {
        const prevUsers = prev[channelId] || [];
        let newUsers;
        if (isTyping) newUsers = prevUsers.includes(username) ? prevUsers : [...prevUsers, username];
        else newUsers = prevUsers.filter(u => u !== username);
        return { ...prev, [channelId]: newUsers };
      });
    });

    return () => {
      disconnectSocket();
      setOnlineUsers({});
      setTypingUsers({});
    };
  }, [user]);

  const typingHandler = (channelId, isTyping) => {
    const username = user?.username;
    if (!username || !socketRef.current) return;
    
    socketRef.current.emit("typing", { channelId, isTyping });

    setTypingUsers(prev => {
        const newTyping = { ...prev };
        const usersInChannel = new Set(newTyping[channelId] || []);

        if (isTyping) {
            usersInChannel.add(username);
        } else {
            usersInChannel.delete(username);
        }

        newTyping[channelId] = Array.from(usersInChannel);
        return newTyping;
    });
  };

  const joinChannel = (channelId) => {
    socketRef.current?.emit("join_channel", { channelId });
  };

  const leaveChannel = (channelId) => {
    socketRef.current?.emit("leave_channel", { channelId });
    if (currentChannel?.id === channelId) setCurrentChannel(null);
  };

  return (
    <ChatContext.Provider
      value={{
        currentChannel,
        setCurrentChannel,
        socket: socketRef.current,
        onlineUsers,
        typingUsers,
        joinChannel,
        leaveChannel,
        typingHandler, 
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};