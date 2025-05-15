// src/services/FileService.ts
import axios from "axios";
import {
  FileMetadata,
  FileQueryParams,
  FileUploadResponse,
} from "../types/files";
import { FileCategory } from "../types/enums";

const API_URL = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});


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
      const response = await axios.post(`${API_URL}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Include cookies
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

    const response = await axios.get(`${API_URL}/files?${queryParams}`, {
      withCredentials: true, // Include cookies
    });
    return response.data;
  }

  /**
   * Get a single file by GUID
   */
  static async getFile(guid: string): Promise<FileMetadata | null> {
    try {
      const response = await axios.get(`${API_URL}/files/${guid}`, {
        withCredentials: true, // Include cookies
      });
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
      await axios.delete(`${API_URL}/files/${guid}`, {
        withCredentials: true, // Include cookies
      });
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
      const response = await axios.get(`${API_URL}/files/${guid}/download`, {
        responseType: "blob",
        withCredentials: true, // Include cookies/auth
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
      const response = await axios.patch(
        `${API_URL}/files/${guid}`,
        { relatedId },
        {
          withCredentials: true, // Include cookies
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating file relation:", error);
      return null;
    }
  }
}

export default FileService;
