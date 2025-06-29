// src/services/AuthService.ts
import axios, { AxiosInstance } from "axios";
import { ChangePasswordDto } from "../types/auth";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    guid: string;
    fullName: string;
    email: string;
    role: string;
    profileImage?: string;
    department?: string;
  };
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

// Create API instance with base configuration
const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token available, redirect to login
          AuthService.logout();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const data: RefreshTokenResponse = response.data;

        // Store new tokens
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        // Update authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        AuthService.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth service methods
export const AuthService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await API.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // Only redirect if we're in a browser environment
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },

  getProfile: async () => {
    const response = await API.get("/auth/profile");
    return response.data;
  },

  changePassword: async (
    changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> => {
    const response = await API.patch<{ message: string }>(
      "/auth/change-password",
      changePasswordDto
    );
    return response.data;
  },

  registerUser: async (userData: any) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await API.post<RefreshTokenResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  isAuthenticated: (): boolean => {
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
