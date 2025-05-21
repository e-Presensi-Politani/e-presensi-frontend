// src/services/FileService.ts (Updated with profile photo handling)
import axios from "axios";
import {
  FileMetadata,
  FileQueryParams,
  FileUploadResponse,
} from "../types/files";
import { FileCategory } from "../types/enums";

// Create a base axios instance with the API URL
const API_URL = import.meta.env.VITE_API_URL;

// Create an axios instance with baseURL properly configured
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include cookies for all requests
});

// Add a request interceptor to include the auth token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class FileService {
  /**
   * Upload a file with progress tracking
   */
  static async uploadFile(
    file: File,
    category: FileCategory,
    relatedId?: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    if (relatedId) {
      formData.append("relatedId", relatedId);
    }

    try {
      const response = await apiClient.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      });

      return {
        success: true,
        data: response.data,
        message: "File uploaded successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as FileMetadata,
        message: error.response?.data?.message || "Error uploading file",
      };
    }
  }

  /**
   * Upload profile photo with specialized handling
   */
  static async uploadProfilePhoto(
    file: File,
    userId: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<FileUploadResponse> {
    // Check file type for profile photos
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        data: {} as FileMetadata,
        message:
          "Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed for profile photos.",
      };
    }

    // Limit file size for profile photos (1MB)
    if (file.size > 1024 * 1024) {
      return {
        success: false,
        data: {} as FileMetadata,
        message: "Profile photo size must be less than 1MB",
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", FileCategory.PROFILE);
    formData.append("relatedId", userId);

    try {
      const response = await apiClient.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      });

      return {
        success: true,
        data: response.data,
        message: "Profile photo uploaded successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as FileMetadata,
        message:
          error.response?.data?.message || "Error uploading profile photo",
      };
    }
  }

  /**
   * Get profile photo URL for a user (convenience method)
   */
  static async getProfilePhotoUrl(userId: string): Promise<string | null> {
    try {
      const files = await this.getFiles({
        category: FileCategory.PROFILE,
        relatedId: userId,
      });

      if (files && files.length > 0) {
        return this.getFileViewUrl(files[0].guid);
      }
      return null;
    } catch (error) {
      console.error("Error getting profile photo URL:", error);
      return null;
    }
  }

  /**
   * Get files based on query parameters
   */
  static async getFiles(params?: FileQueryParams): Promise<FileMetadata[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.relatedId) {
      queryParams.append("relatedId", params.relatedId);
    }

    const response = await apiClient.get(`/files?${queryParams}`);
    return response.data;
  }

  /**
   * Get a single file by GUID
   */
  static async getFile(guid: string): Promise<FileMetadata | null> {
    try {
      const response = await apiClient.get(`/files/${guid}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  }

  /**
   * Delete a file by GUID
   */
  static async deleteFile(guid: string): Promise<boolean> {
    try {
      await apiClient.delete(`/files/${guid}`);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Get file view URL
   */
  static getFileViewUrl(guid: string): string {
    return `${API_URL}/files/${guid}/view`;
  }

  /**
   * Get file download URL
   */
  static getFileDownloadUrl(guid: string): string {
    return `${API_URL}/files/${guid}/download`;
  }

  /**
   * Download a file with authentication
   */
  static async downloadFile(guid: string, filename?: string): Promise<void> {
    try {
      // Get token from localStorage directly for this specific request
      const token = localStorage.getItem("access_token");

      const response = await apiClient.get(`/files/${guid}/download`, {
        responseType: "blob",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      // Create a blob URL and initiate download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || `file-${guid}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Update file relation
   */
  static async updateFileRelation(
    guid: string,
    relatedId: string
  ): Promise<FileMetadata | null> {
    try {
      const response = await apiClient.patch(`/files/${guid}`, { relatedId });
      return response.data;
    } catch (error) {
      console.error("Error updating file relation:", error);
      return null;
    }
  }
}

export default FileService;
