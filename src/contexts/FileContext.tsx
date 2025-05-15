// src/contexts/FileContext.tsx (Updated)
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import {
  FileMetadata,
  FileQueryParams,
  FileUploadProgress,
  FileUploadResponse,
} from "../types/files";
import { FileCategory } from "../types/enums";
import FileService from "../services/FileService";

interface FileContextType {
  files: FileMetadata[];
  uploadProgress: FileUploadProgress;
  isLoading: boolean;
  error: string | null;
  uploadFile: (
    file: File,
    category?: FileCategory,
    relatedId?: string
  ) => Promise<FileUploadResponse>;
  getFiles: (params?: FileQueryParams) => Promise<void>;
  getFile: (guid: string) => Promise<FileMetadata | null>;
  deleteFile: (guid: string) => Promise<boolean>;
  getFileViewUrl: (guid: string) => string;
  getFileDownloadUrl: (guid: string) => string;
  downloadFile: (guid: string, filename?: string) => Promise<void>;
  updateFileRelation: (
    guid: string,
    relatedId: string
  ) => Promise<FileMetadata | null>;
  clearFiles: () => void;
  clearError: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFiles = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
};

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress>({
    isUploading: false,
    progress: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a file with progress tracking
   */
  const uploadFile = useCallback(
    async (
      file: File,
      category: FileCategory = FileCategory.OTHER,
      relatedId?: string
    ): Promise<FileUploadResponse> => {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        file,
      });

      try {
        const response = await FileService.uploadFile(
          file,
          category,
          relatedId,
          (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({
              ...prev,
              progress: percentCompleted,
            }));
          }
        );

        if (response.success) {
          setFiles((prevFiles) => [response.data, ...prevFiles]);
        } else {
          setError(response.message || "Error uploading file");
        }

        return response;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Error uploading file";
        setError(errorMessage);
        return {
          success: false,
          data: {} as FileMetadata,
          message: errorMessage,
        };
      } finally {
        setUploadProgress({
          isUploading: false,
          progress: 0,
        });
      }
    },
    []
  );

  /**
   * Get files based on query parameters
   */
  const getFiles = useCallback(
    async (params?: FileQueryParams): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedFiles = await FileService.getFiles(params);
        setFiles(fetchedFiles);
      } catch (error: any) {
        setError(error.message || "Error fetching files");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get a single file by GUID
   */
  const getFile = useCallback(
    async (guid: string): Promise<FileMetadata | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await FileService.getFile(guid);
      } catch (error: any) {
        setError(error.message || `Error fetching file ${guid}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete a file by GUID
   */
  const deleteFile = useCallback(async (guid: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await FileService.deleteFile(guid);
      if (success) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.guid !== guid));
      }
      return success;
    } catch (error: any) {
      setError(error.message || `Error deleting file ${guid}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get file view URL
   */
  const getFileViewUrl = useCallback((guid: string): string => {
    return FileService.getFileViewUrl(guid);
  }, []);

  /**
   * Get file download URL
   */
  const getFileDownloadUrl = useCallback((guid: string): string => {
    return FileService.getFileDownloadUrl(guid);
  }, []);

  /**
   * Download file with authentication
   */
  const downloadFile = useCallback(
    async (guid: string, filename?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await FileService.downloadFile(guid, filename);
      } catch (error: any) {
        setError(error.message || `Error downloading file ${guid}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update file relation
   */
  const updateFileRelation = useCallback(
    async (guid: string, relatedId: string): Promise<FileMetadata | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedFile = await FileService.updateFileRelation(
          guid,
          relatedId
        );
        if (updatedFile) {
          setFiles((prevFiles) =>
            prevFiles.map((file) => (file.guid === guid ? updatedFile : file))
          );
        }
        return updatedFile;
      } catch (error: any) {
        setError(error.message || `Error updating file relation for ${guid}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear files state
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    files,
    uploadProgress,
    isLoading,
    error,
    uploadFile,
    getFiles,
    getFile,
    deleteFile,
    getFileViewUrl,
    getFileDownloadUrl,
    downloadFile,
    updateFileRelation,
    clearFiles,
    clearError,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};
