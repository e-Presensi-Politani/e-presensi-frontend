// src/services/LeaveRequestsService.ts
import axios from "axios";
import {
  LeaveRequest,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ReviewLeaveRequestDto,
  QueryLeaveRequestsDto,
} from "../types/leave-requests";
import AuthService from "./AuthService";

// Reuse the API instance with the same configuration as other services
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

const LeaveRequestsService = {
  /**
   * Create a new leave request with attachment
   */
  createLeaveRequest: async (
    data: CreateLeaveRequestDto,
    attachmentFile: File
  ): Promise<LeaveRequest> => {
    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append("departmentId", data.departmentId);
    formData.append("type", data.type);
    formData.append("startDate", new Date(data.startDate).toISOString());
    formData.append("endDate", new Date(data.endDate).toISOString());
    formData.append("reason", data.reason);
    formData.append("attachment", attachmentFile);

    const response = await API.post<LeaveRequest>("/leave-requests", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Get all leave requests with optional filters
   */
  getAllLeaveRequests: async (
    query?: QueryLeaveRequestsDto
  ): Promise<LeaveRequest[]> => {
    const params = new URLSearchParams();

    if (query) {
      // Add query parameters if they exist
      if (query.userId) params.append("userId", query.userId);
      if (query.departmentId) params.append("departmentId", query.departmentId);

      if (query.type && query.type.length > 0) {
        query.type.forEach((type) => params.append("type", type));
      }

      if (query.status && query.status.length > 0) {
        query.status.forEach((status) => params.append("status", status));
      }

      if (query.startDateFrom)
        params.append(
          "startDateFrom",
          new Date(query.startDateFrom).toISOString()
        );
      if (query.startDateTo)
        params.append("startDateTo", new Date(query.startDateTo).toISOString());
      if (query.endDateFrom)
        params.append("endDateFrom", new Date(query.endDateFrom).toISOString());
      if (query.endDateTo)
        params.append("endDateTo", new Date(query.endDateTo).toISOString());
      if (query.reviewedDateFrom)
        params.append(
          "reviewedDateFrom",
          new Date(query.reviewedDateFrom).toISOString()
        );
      if (query.reviewedDateTo)
        params.append(
          "reviewedDateTo",
          new Date(query.reviewedDateTo).toISOString()
        );
    }

    const response = await API.get<LeaveRequest[]>("/leave-requests", {
      params,
    });
    return response.data;
  },

  /**
   * Get leave requests for the current user
   */
  getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await API.get<LeaveRequest[]>(
      "/leave-requests/my-requests"
    );
    return response.data;
  },

  /**
   * Get pending leave requests for a department
   */
  getPendingLeaveRequests: async (
    departmentId?: string
  ): Promise<LeaveRequest[]> => {
    const params = departmentId ? { departmentId } : {};
    const response = await API.get<LeaveRequest[]>("/leave-requests/pending", {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific leave request by GUID
   */
  getLeaveRequestByGuid: async (guid: string): Promise<LeaveRequest> => {
    const response = await API.get<LeaveRequest>(`/leave-requests/${guid}`);
    return response.data;
  },

  /**
   * Update a leave request
   */
  updateLeaveRequest: async (
    guid: string,
    data: UpdateLeaveRequestDto,
    attachmentFile?: File
  ): Promise<LeaveRequest> => {
    // Use FormData to handle file uploads
    const formData = new FormData();

    if (data.type) formData.append("type", data.type);
    if (data.startDate)
      formData.append("startDate", new Date(data.startDate).toISOString());
    if (data.endDate)
      formData.append("endDate", new Date(data.endDate).toISOString());
    if (data.reason) formData.append("reason", data.reason);
    if (attachmentFile) formData.append("attachment", attachmentFile);

    const response = await API.patch<LeaveRequest>(
      `/leave-requests/${guid}`,
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
   * Delete a leave request
   */
  deleteLeaveRequest: async (guid: string): Promise<void> => {
    await API.delete(`/leave-requests/${guid}`);
  },

  /**
   * Review a leave request (approve or reject)
   */
  reviewLeaveRequest: async (
    guid: string,
    reviewData: ReviewLeaveRequestDto
  ): Promise<LeaveRequest> => {
    const response = await API.post<LeaveRequest>(
      `/leave-requests/${guid}/review`,
      reviewData
    );
    return response.data;
  },

  /**
   * Get attachment file information
   */
  getAttachmentInfo: async (guid: string): Promise<any> => {
    const response = await API.get(`/leave-requests/${guid}/attachment`);
    return response.data;
  },

  /**
   * Get the download URL for an attachment
   */
  getAttachmentDownloadUrl: (guid: string): string => {
    return `${import.meta.env.VITE_API_URL}/files/download/${guid}`;
  },
};

export default LeaveRequestsService;
