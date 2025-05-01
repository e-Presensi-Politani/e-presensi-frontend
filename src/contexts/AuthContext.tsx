// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/AuthService";
import { ChangePasswordDto } from "../types/auth";

export interface User {
  guid: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  registerUser?: (userData: any) => Promise<void>; // Admin only
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const userData = AuthService.getUser();

          // Validate stored user data by fetching fresh profile
          await AuthService.getProfile(); // This will trigger token refresh if needed

          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error restoring auth state:", error);
          AuthService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(email, password);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      await AuthService.changePassword(changePasswordDto);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Password change failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData: any) => {
    // Only available for admin users
    if (!user || user.role !== "ADMIN") {
      setError("Unauthorized: Only admins can register new users");
      throw new Error("Unauthorized: Only admins can register new users");
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.registerUser(userData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "User registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    registerUser: user?.role === "ADMIN" ? registerUser : undefined,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
