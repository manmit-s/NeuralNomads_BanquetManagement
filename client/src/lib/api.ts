import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT token ──
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor: handle 401 ──
// NOTE: Do NOT do window.location.href = "/login" here!
// That causes a full page reload which destroys Zustand state and creates
// an infinite redirect loop. Instead, just clear tokens and let React
// Router's ProtectedRoute handle the redirect naturally.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
        return Promise.reject(error);
    }
);

export default api;
