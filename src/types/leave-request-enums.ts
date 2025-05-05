// src/types/leave-request-enums.ts
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

// Helper for translating enum values to display text
export const LeaveRequestTypeLabels: Record<LeaveRequestType, string> = {
  [LeaveRequestType.LEAVE]: "Cuti",
  [LeaveRequestType.WFH]: "Work From Home",
  [LeaveRequestType.WFA]: "Work From Anywhere",
  [LeaveRequestType.DL]: "Dinas Luar",
};

export const LeaveRequestStatusLabels: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.PENDING]: "Menunggu Persetujuan",
  [LeaveRequestStatus.APPROVED]: "Disetujui",
  [LeaveRequestStatus.REJECTED]: "Ditolak",
};

// Helper for status badge colors
export const LeaveRequestStatusColors: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.PENDING]: "warning",
  [LeaveRequestStatus.APPROVED]: "success",
  [LeaveRequestStatus.REJECTED]: "error",
};
