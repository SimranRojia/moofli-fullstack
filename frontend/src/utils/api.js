import axios from "axios";

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-backend-domain.vercel.app/api"
    : "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const userData = localStorage.getItem("user");
  if (userData) {
    const token = JSON.parse(userData).token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
