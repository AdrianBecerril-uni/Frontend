import axios from 'axios';

// In development, Vite proxy handles /api → backend
// In production (Render), VITE_API_URL points to the backend URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add JWT Token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('steamates_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
