// src/services/DepartmentService.ts
import axios from "axios";
import { Department } from "../types/departments";

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

const DepartmentService = {
  /**
   * Get all departments
   * @returns Array of all departments
   */
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await API.get<Department[]>("/departments");
    return response.data;
  },

  /**
   * Get a department by ID
   * @param guid The department ID
   * @returns The department details
   */
  getDepartmentById: async (guid: string): Promise<Department> => {
    const response = await API.get<Department>(`/departments/${guid}`);
    return response.data;
  },

  /**
   * Get a department by name
   * @param name The department name
   * @returns The department details
   */
  getDepartmentByName: async (name: string): Promise<Department> => {
    const response = await API.get<Department>(
      `/departments/by-name/${encodeURIComponent(name)}`
    );
    return response.data;
  },

  /**
   * Get departments by head (department leader)
   * @param headId User ID of the department head
   * @returns Array of departments led by the specified user
   */
  getDepartmentsByHead: async (headId: string): Promise<Department[]> => {
    const response = await API.get<Department[]>(
      `/departments/by-head/${headId}`
    );
    return response.data;
  },

  /**
   * Get departments by member
   * @param memberId User ID of the department member
   * @returns Array of departments the user belongs to
   */
  getDepartmentsByMember: async (memberId: string): Promise<Department[]> => {
    const response = await API.get<Department[]>(
      `/departments/by-member/${memberId}`
    );
    return response.data;
  },
};

export default DepartmentService;
