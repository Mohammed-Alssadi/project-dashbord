import axios from 'axios';

const baseApiUrl = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: baseApiUrl,
});

// Automatically inject JWT token into authorization header if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
