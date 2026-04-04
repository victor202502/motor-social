import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://56.228.1.23:3000";

const api = axios.create({
    baseURL: API_URL,
});

// Automatically attach token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;