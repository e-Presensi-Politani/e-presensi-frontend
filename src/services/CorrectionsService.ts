// src/services/CorrectionsService.ts
import axios from "axios";
import {
  Correction,
  CreateCorrectionDto,
  UpdateCorrectionDto,
  CorrectionQueryParams,
  MonthlyUsage,
} from "../types/corrections";

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

const CorrectionsService = {
  /**
   * Create a new correction request
   * @param correctionData The correction request data
   * @returns The created correction
   */
  createCorrection: async (
    correctionData: CreateCorrectionDto
  ): Promise<Correction> => {
    const response = await API.post<Correction>("/corrections", correctionData);
    return response.data;
  },

  /**
   * Get all corrections with optional query parameters
   * @param queryParams Query parameters to filter corrections
   * @returns Array of corrections matching the query
   */
  getAllCorrections: async (
    queryParams?: CorrectionQueryParams
  ): Promise<Correction[]> => {
    const response = await API.get<Correction[]>("/corrections", {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get correction requests for the current user
   * @param queryParams Query parameters to filter corrections
   * @returns Array of user's corrections matching the query
   */
  getMyCorrections: async (
    queryParams?: CorrectionQueryParams
  ): Promise<Correction[]> => {
    const response = await API.get<Correction[]>("/corrections/my-requests", {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get monthly usage statistics for the current user
   * @returns Monthly usage information
   */
  getMonthlyUsage: async (): Promise<MonthlyUsage> => {
    const response = await API.get<MonthlyUsage>("/corrections/monthly-usage");
    return response.data;
  },

  /**
   * Get pending corrections for a specific department
   * @param departmentId The department ID
   * @returns Array of pending corrections for the department
   */
  getPendingByDepartment: async (
    departmentId: string
  ): Promise<Correction[]> => {
    const response = await API.get<Correction[]>(
      `/corrections/department/${departmentId}/pending`
    );
    return response.data;
  },

  /**
   * Get a single correction by ID
   * @param guid The correction ID
   * @returns The correction details
   */
  getCorrectionById: async (guid: string): Promise<Correction> => {
    const response = await API.get<Correction>(`/corrections/${guid}`);
    return response.data;
  },

  /**
   * Review (approve/reject) a correction request
   * @param guid The correction ID
   * @param reviewData The review decision data
   * @returns The updated correction
   */
  reviewCorrection: async (
    guid: string,
    reviewData: UpdateCorrectionDto
  ): Promise<Correction> => {
    const response = await API.put<Correction>(
      `/corrections/${guid}/review`,
      reviewData
    );
    return response.data;
  },
};

export default CorrectionsService;
