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

export default api;
