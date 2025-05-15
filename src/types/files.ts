// src/types/files.ts
import { FileCategory } from "./enums";

export interface FileMetadata {
  guid: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  category: FileCategory;
  userId: string;
  relatedId?: string;
  isTemporary?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUploadResponse {
  success: boolean;
  data: FileMetadata;
  message?: string;
}

export interface FileQueryParams {
  category?: FileCategory;
  relatedId?: string;
}

export interface UploadFileDto {
  category?: FileCategory;
  relatedId?: string;
}

export interface FileUploadProgress {
  isUploading: boolean;
  progress: number;
  file?: File;
}
