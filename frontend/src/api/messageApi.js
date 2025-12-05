import axios from "axios";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE}/api/messages`,
  withCredentials: true
});

export const getMessages = (channelId, limit = 30, before = null) => {
  const params = { limit };
  if (before) params.before = before;
  return api.get(`/${channelId}`, { params }).then(r => r.data);
};

// POST mark read: POST /api/messages/:channelId/mark-read
export const markRead = (channelId) => api.post(`/${channelId}/mark-read`).then(r => r.data);

