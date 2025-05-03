// src/services/AttendanceService.ts
import axios from "axios";
import {
  Attendance,
  CheckInDto,
  CheckOutDto,
  VerifyAttendanceDto,
  AttendanceQueryParams,
  AttendanceSummary,
} from "../types/attendance";
import AuthService from "./AuthService";

// Create API instance with base configuration
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

// Helper function to prepare form data with file
const prepareFormData = (data: any, photo?: File): FormData => {
  const formData = new FormData();

  // Add data fields to form data
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key].toString());
    }
  });

  // Add photo if exists
  if (photo) {
    formData.append("photo", photo);
  }

  return formData;
};

const AttendanceService = {
  /**
   * Check in for today
   */
  checkIn: async (
    checkInData: CheckInDto,
    photo?: File
  ): Promise<Attendance> => {
    const formData = prepareFormData(checkInData, photo);

    const response = await API.post<Attendance>(
      "/attendance/check-in",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Check out for today
   */
  checkOut: async (
    checkOutData: CheckOutDto,
    photo?: File
  ): Promise<Attendance> => {
    const formData = prepareFormData(checkOutData, photo);

    const response = await API.post<Attendance>(
      "/attendance/check-out",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Get today's attendance record for the current user
   */
  getTodayAttendance: async (): Promise<Attendance | null> => {
    const response = await API.get<Attendance>("/attendance/today");
    return response.data;
  },

  /**
   * Get all attendance records based on query parameters
   */
  getAllAttendance: async (
    params: AttendanceQueryParams
  ): Promise<Attendance[]> => {
    const response = await API.get<Attendance[]>("/attendance", { params });
    return response.data;
  },

  /**
   * Get user's own attendance records
   */
  getMyAttendance: async (
    params: AttendanceQueryParams
  ): Promise<Attendance[]> => {
    const response = await API.get<Attendance[]>("/attendance/my-records", {
      params,
    });
    return response.data;
  },

  /**
   * Get attendance summary for a specific period (admin/department head)
   */
  getAttendanceSummary: async (
    startDate: string,
    endDate: string,
    userId?: string,
    departmentId?: string
  ): Promise<AttendanceSummary> => {
    const params = { startDate, endDate, userId, departmentId };
    const response = await API.get<AttendanceSummary>("/attendance/summary", {
      params,
    });
    return response.data;
  },

  /**
   * Get attendance summary for current user
   */
  getMyAttendanceSummary: async (
    startDate: string,
    endDate: string
  ): Promise<AttendanceSummary> => {
    const params = { startDate, endDate };
    const response = await API.get<AttendanceSummary>(
      "/attendance/my-summary",
      { params }
    );
    return response.data;
  },

  /**
   * Get a specific attendance record by GUID
   */
  getAttendanceById: async (guid: string): Promise<Attendance> => {
    const response = await API.get<Attendance>(`/attendance/${guid}`);
    return response.data;
  },

  /**
   * Verify an attendance record (for admin/department head)
   */
  verifyAttendance: async (
    guid: string,
    verifyData: VerifyAttendanceDto
  ): Promise<Attendance> => {
    const response = await API.put<Attendance>(
      `/attendance/${guid}/verify`,
      verifyData
    );
    return response.data;
  },
};

export default AttendanceService;
