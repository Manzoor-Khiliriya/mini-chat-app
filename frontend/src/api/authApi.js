import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE}/api/auth`,
  withCredentials: true,
});

// Helper to handle errors
const handleError = (error) => {
  if (error.response) {
    // Server responded with status code outside 2xx
    return { error: error.response.data.message || "Server error", status: error.response.status };
  } else if (error.request) {
    // Request made but no response
    return { error: "No response from server", status: null };
  } else {
    // Something else
    return { error: error.message, status: null };
  }
};

// Sign Up
export const signup = async (data) => {
  try {
    const res = await api.post("/signup", data);
    return { data: res.data };
  } catch (err) {
    return handleError(err);
  }
};

// Login
export const login = async (data) => {
  try {
    const res = await api.post("/login", data);
    return { data: res.data };
  } catch (err) {
    return handleError(err);
  }
};

// Logout
export const logout = async () => {
  try {
    const res = await api.post("/logout");
    return { data: res.data };
  } catch (err) {
    return handleError(err);
  }
};

// Get Authenticated User
export const getMe = async () => {
  try {
    const res = await api.get("/me");
    return { data: res.data };
  } catch (err) {
    return handleError(err);
  }
};
