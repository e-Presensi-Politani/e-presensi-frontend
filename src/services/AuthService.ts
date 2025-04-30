// src/services/AuthService.ts
import axios from "axios";

// Create API instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // adjust this to your API URL
});

// Set up request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Set up response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = "/";
          return Promise.reject(error);
        }

        const response = await axios.post("/auth/refresh", {
          refresh_token: refreshToken,
        });

        // Store new tokens
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);

        // Update authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth service methods
export const AuthService = {
  login: async (email: string, password: string) => {
    const response = await API.post("/auth/login", { email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/";
  },

  getProfile: async () => {
    const response = await API.get("/auth/profile");
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  getUser: () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  },
};

export default AuthService;
