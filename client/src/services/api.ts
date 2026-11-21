import axios from 'axios';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Determine backend URL dynamically based on browser host
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        config.baseURL = envUrl;
      } else {
        const hostname = window.location.hostname || 'localhost';
        config.baseURL = `http://${hostname}:5000/api`;
      }

      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      config.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
