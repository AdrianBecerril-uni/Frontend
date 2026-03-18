import axios from "axios";

// In development, Vite proxy handles /api → backend
// In production, VITE_API_URL points to the backend URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("steamates_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCommonGames = (steamIds: string[]) =>
  api.post("/api/steam/common-games", { steamIds });

export default api;