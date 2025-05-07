// src/types/corrections.ts
export enum CorrectionType {
  BREAK_TIME_AS_WORK = "BREAK_TIME_AS_WORK",
  EARLY_DEPARTURE = "EARLY_DEPARTURE",
  LATE_ARRIVAL = "LATE_ARRIVAL",
  MISSED_CHECK_IN = "MISSED_CHECK_IN",
  MISSED_CHECK_OUT = "MISSED_CHECK_OUT",
}

export enum CorrectionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Correction {
  guid: string;
  userId: string;
  departmentId: string;
  type: CorrectionType;
  date: string;
  reason: string;
  status: CorrectionStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  attendanceId?: string;
  proposedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCorrectionDto {
  type: CorrectionType;
  date: string;
  reason: string;
  proposedTime?: string;
  attendanceId?: string;
}

export interface UpdateCorrectionDto {
  status: CorrectionStatus;
  rejectionReason?: string;
}

export interface CorrectionQueryParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
  departmentId?: string;
  status?: CorrectionStatus;
  type?: CorrectionType;
}

export interface MonthlyUsage {
  used: number;
  limit: number;
}
