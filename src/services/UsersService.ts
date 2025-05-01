// src/services/UsersService.ts
import axios from "axios";
import { CreateUserDto, UpdateUserDto, User } from "../types/users";
import AuthService from "./AuthService";

// Reuse the API instance from AuthService to make use of the already
// configured interceptors for authentication and token refresh
const API = axios.create({
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

        const response = await AuthService.refreshToken(refreshToken);

        // Store new tokens
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);

        // Update authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
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

const UsersService = {
  /**
   * Get all users (admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await API.get<User[]>("/users");
    return response.data;
  },

  /**
   * Get user by GUID
   */
  getUserByGuid: async (guid: string): Promise<User> => {
    const response = await API.get<User>(`/users/${guid}`);
    return response.data;
  },

  /**
   * Create a new user (admin only)
   */
  createUser: async (userData: CreateUserDto): Promise<User> => {
    const response = await API.post<User>("/users", userData);
    return response.data;
  },

  /**
   * Update user details
   */
  updateUser: async (guid: string, userData: UpdateUserDto): Promise<User> => {
    const response = await API.patch<User>(`/users/${guid}`, userData);
    return response.data;
  },

  /**
   * Delete a user (admin only)
   */
  deleteUser: async (guid: string): Promise<void> => {
    await API.delete(`/users/${guid}`);
  },

  /**
   * Check if the current user has admin privileges
   */
  isAdmin: (): boolean => {
    const user = AuthService.getUser();
    return user?.role === "ADMIN";
  },
};

export default UsersService;
