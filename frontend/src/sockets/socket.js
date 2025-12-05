import { io } from "socket.io-client";
const URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

export function initSocket() {
  if (!socket) {
    socket = io(URL, {
      withCredentials: true,
      transports: ["websocket"], // fast + avoids polling
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}
