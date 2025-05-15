// src/services/FileService.ts
import axios from "axios";
import {
  FileMetadata,
  FileQueryParams,
  FileUploadResponse,
} from "../types/files";
import { FileCategory } from "../types/enums";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class FileService {
  /**
   * Upload a file to the server
   * @param file The file to upload
   * @param category File category
   * @param relatedId Optional related resource ID
   * @param onUploadProgress Optional progress callback
   * @returns Promise with the upload response
   */
  async uploadFile(
    file: File,
    category: FileCategory = FileCategory.OTHER,
    relatedId?: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // Add query parameters
    const params = new URLSearchParams();
    if (category) {
      params.append("category", category);
    }
    if (relatedId) {
      params.append("relatedId", relatedId);
    }

    try {
      const response = await axios.post<FileMetadata>(
        `${API_URL}/files/upload?${params.toString()}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress,
        }
      );

      return {
        success: true,
        data: response.data,
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
   * Get all files based on query parameters
   * @param params Query parameters
   * @returns Promise with array of file metadata
   */
  async getFiles(params?: FileQueryParams): Promise<FileMetadata[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.category) {
        queryParams.append("category", params.category);
      }

      if (params?.relatedId) {
        queryParams.append("relatedId", params.relatedId);
      }

      const response = await axios.get<FileMetadata[]>(
        `${API_URL}/files?${queryParams.toString()}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching files:", error);
      return [];
    }
  }

  /**
   * Get a single file by GUID
   * @param guid File GUID
   * @returns Promise with file metadata
   */
  async getFile(guid: string): Promise<FileMetadata | null> {
    try {
      const response = await axios.get<FileMetadata>(
        `${API_URL}/files/${guid}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching file ${guid}:`, error);
      return null;
    }
  }

  /**
   * Delete a file by GUID
   * @param guid File GUID
   * @returns Promise with success status
   */
  async deleteFile(guid: string): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/files/${guid}`, {
        withCredentials: true,
      });

      return true;
    } catch (error) {
      console.error(`Error deleting file ${guid}:`, error);
      return false;
    }
  }

  /**
   * Get file view URL
   * @param guid File GUID
   * @returns URL to view the file
   */
  getFileViewUrl(guid: string): string {
    return `${API_URL}/files/${guid}/view`;
  }

  /**
   * Get file download URL
   * @param guid File GUID
   * @returns URL to download the file
   */
  getFileDownloadUrl(guid: string): string {
    return `${API_URL}/files/${guid}/download`;
  }

  /**
   * Update file relation
   * @param guid File GUID
   * @param relatedId Related resource ID
   * @returns Promise with updated file metadata
   */
  async updateFileRelation(
    guid: string,
    relatedId: string
  ): Promise<FileMetadata | null> {
    try {
      const response = await axios.patch<FileMetadata>(
        `${API_URL}/files/${guid}/relation`,
        { relatedId },
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error updating file relation for ${guid}:`, error);
      return null;
    }
  }
}

export default new FileService();
