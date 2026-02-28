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
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            // Rather than force-reloading the browser (which resets the demo user and loops),
            // we dispatch a custom event so the React layer can handle UI state gracefully.
            // window.dispatchEvent(new Event("auth-expired")); // DISABLED FOR DEMO
        }
        return Promise.reject(error);
    }
);

export default api;
