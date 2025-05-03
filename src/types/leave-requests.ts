// src/types/leave-requests.ts

export enum LeaveRequestType {
  LEAVE = "LEAVE", // Cuti
  WFH = "WFH", // Work From Home
  WFA = "WFA", // Work From Anywhere
  DL = "DL", // Dinas Luar
}

export enum LeaveRequestStatus {
  PENDING = "PENDING", // Menunggu persetujuan
  APPROVED = "APPROVED", // Disetujui
  REJECTED = "REJECTED", // Ditolak
}

export interface LeaveRequest {
  guid: string;
  userId: string;
  departmentId: string;
  type: LeaveRequestType;
  startDate: Date;
  endDate: Date;
  reason: string;
  attachmentId: string;
  status: LeaveRequestStatus;
  reviewedById?: string;
  reviewedAt?: Date;
  comments?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Additional properties from controller response
  attachment?: {
    guid: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
  };

  // UI helper properties (optional)
  userName?: string;
  departmentName?: string;
  reviewerName?: string;
}

export interface CreateLeaveRequestDto {
  departmentId: string;
  type: LeaveRequestType;
  startDate: Date;
  endDate: Date;
  reason: string;
  attachment?: File; // For form handling
}

export interface UpdateLeaveRequestDto {
  type?: LeaveRequestType;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  attachment?: File; // For form handling
}

export interface ReviewLeaveRequestDto {
  status: LeaveRequestStatus;
  comments?: string;
}

export interface QueryLeaveRequestsDto {
  userId?: string;
  departmentId?: string;
  type?: LeaveRequestType[];
  status?: LeaveRequestStatus[];
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  reviewedDateFrom?: Date;
  reviewedDateTo?: Date;
}
