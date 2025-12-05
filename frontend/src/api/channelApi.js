import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE}/api/channels`,
  withCredentials: true
});

export const getChannels = async () => {
  const res = await api.get('/');
  return res.data;
};

export const getChannelDetails = async (channelId) => {
  const res = await api.get(`/${channelId}`);
  return res.data;
};

export const createChannel = async (payload) => {
  const res = await api.post('/', payload);
  return res.data;
};

export const requestJoinChannel = async (channelId) => {
  const res = await api.post(`/${channelId}/join`);
  return res.data;
};

export const leaveChannel = async (channelId) => {
  const res = await api.post(`/${channelId}/leave`);
  return res.data;
};

export const listJoinRequests = async (channelId) => {
  const res = await api.get(`/${channelId}/requests`);
  return res.data;
};

export const approveJoinRequest = async (requestId) => {
  const res = await api.post(`/requests/${requestId}/approve`);
  return res.data;
};

export const rejectJoinRequest = async (requestId) => {
  const res = await api.post(`/requests/${requestId}/reject`);
  return res.data;
};
