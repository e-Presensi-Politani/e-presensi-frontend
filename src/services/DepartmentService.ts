// src/services/DepartmentService.ts
import axios from "axios";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  AssignHeadDto,
  AddMembersDto,
} from "../types/departments";
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

const DepartmentService = {
  /**
   * Get all departments
   */
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await API.get<Department[]>("/departments");
    return response.data;
  },

  /**
   * Get all departments including inactive ones (admin only)
   */
  getAllWithInactive: async (): Promise<Department[]> => {
    const response = await API.get<Department[]>("/departments/with-inactive");
    return response.data;
  },

  /**
   * Get department by GUID
   */
  getDepartmentByGuid: async (guid: string): Promise<Department> => {
    const response = await API.get<Department>(`/departments/${guid}`);
    return response.data;
  },

  /**
   * Get department by code
   */
  getDepartmentByCode: async (code: string): Promise<Department> => {
    const response = await API.get<Department>(`/departments/code/${code}`);
    return response.data;
  },

  /**
   * Create a new department (admin only)
   */
  createDepartment: async (
    departmentData: CreateDepartmentDto
  ): Promise<Department> => {
    const response = await API.post<Department>("/departments", departmentData);
    return response.data;
  },

  /**
   * Update department details (admin only)
   */
  updateDepartment: async (
    guid: string,
    departmentData: UpdateDepartmentDto
  ): Promise<Department> => {
    const response = await API.put<Department>(
      `/departments/${guid}`,
      departmentData
    );
    return response.data;
  },

  /**
   * Delete a department (soft delete) (admin only)
   */
  deleteDepartment: async (guid: string): Promise<Department> => {
    const response = await API.delete<Department>(`/departments/${guid}`);
    return response.data;
  },

  /**
   * Delete a department permanently (admin only)
   */
  hardDeleteDepartment: async (guid: string): Promise<Department> => {
    const response = await API.delete<Department>(`/departments/${guid}/hard`);
    return response.data;
  },

  /**
   * Assign department head (admin only)
   */
  assignDepartmentHead: async (
    guid: string,
    assignHeadDto: AssignHeadDto
  ): Promise<Department> => {
    const response = await API.put<Department>(
      `/departments/${guid}/head`,
      assignHeadDto
    );
    return response.data;
  },

  /**
   * Add members to department (admin or department head)
   */
  addDepartmentMembers: async (
    guid: string,
    addMembersDto: AddMembersDto
  ): Promise<Department> => {
    const response = await API.put<Department>(
      `/departments/${guid}/members`,
      addMembersDto
    );
    return response.data;
  },

  /**
   * Remove members from department (admin or department head)
   */
  removeDepartmentMembers: async (
    guid: string,
    membersDto: AddMembersDto
  ): Promise<Department> => {
    const response = await API.delete<Department>(
      `/departments/${guid}/members`,
      {
        data: membersDto,
      }
    );
    return response.data;
  },

  /**
   * Get departments by member
   */
  getDepartmentsByMember: async (userId: string): Promise<Department[]> => {
    const response = await API.get<Department[]>(
      `/departments/by-member/${userId}`
    );
    return response.data;
  },

  /**
   * Get department by head
   */
  getDepartmentByHead: async (userId: string): Promise<Department[]> => {
    const response = await API.get<Department[]>(
      `/departments/by-head/${userId}`
    );
    return response.data;
  },
};

export default DepartmentService;
