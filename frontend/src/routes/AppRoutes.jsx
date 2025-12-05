import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ChannelsPage from "../pages/ChannelsPage";
import ChatPage from "../pages/ChatPage";
import { AuthContext } from "../context/AuthContext";

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <ChannelsPage /> : <Navigate to="/login" />} />
      <Route path="/chat/:channelId" element={user ? <ChatPage /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
