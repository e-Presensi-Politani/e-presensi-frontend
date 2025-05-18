// src/services/statisticsService.ts
import axios from "axios";
import {
  StatisticsQueryParams,
  StatisticsSummary,
  GenerateReportParams,
  GenerateReportResponse,
} from "../types/statistics";
import AuthService from "./AuthService";

// Get the base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL;

// Create a configured axios instance
const API = axios.create({
  baseURL: BASE_URL,
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

class StatisticsService {
  /**
   * Get statistics data based on query parameters
   * @param params Query parameters for filtering statistics
   * @returns Promise with statistics data
   */
  async getStatistics(
    params: StatisticsQueryParams
  ): Promise<StatisticsSummary> {
    try {
      const response = await API.get("/statistics", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }

  /**
   * Get current user's statistics data based on query parameters
   * @param params Query parameters for filtering statistics
   * @returns Promise with statistics data
   */
  async getMyStatistics(
    params: StatisticsQueryParams
  ): Promise<StatisticsSummary> {
    try {
      const response = await API.get("/statistics/my-statistics", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching my statistics:", error);
      throw error;
    }
  }

  /**
   * Generate a report (Admin/Kajur only)
   * @param data Parameters for generating the report
   * @returns Promise with report generation result
   */
  async generateReport(
    data: GenerateReportParams
  ): Promise<GenerateReportResponse> {
    try {
      const response = await API.post("/statistics/generate-report", data);
      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  /**
   * Generate a report for the current user
   * @param data Parameters for generating the report
   * @returns Promise with report generation result
   */
  async generateMyReport(
    data: GenerateReportParams
  ): Promise<GenerateReportResponse> {
    try {
      const response = await API.post("/statistics/generate-my-report", data);
      return response.data;
    } catch (error) {
      console.error("Error generating personal report:", error);
      throw error;
    }
  }

  /**
   * Get download URL for a report
   * @param fileName Name of the file to download
   * @returns Full URL for downloading the report
   */
  getDownloadUrl(fileName: string): string {
    return `${BASE_URL}/statistics/download/${fileName}`;
  }

  /**
   * Trigger download of a report
   * @param downloadUrl URL to download the report from
   */
  downloadReport(downloadUrl: string): void {
    window.open(downloadUrl, "_blank");
  }
}

export default new StatisticsService();
