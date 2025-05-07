// src/types/corrections.ts
export interface Correction {
  guid: string;
  userId: string;
  departmentId: string;
  attendanceId: string;
  correctionType: string;
  requestDate: Date | string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCorrectionDto {
  attendanceId: string;
  correctionType: string;
  requestDate: Date | string;
  description: string;
}

export interface UpdateCorrectionDto {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

export interface CorrectionQueryParams {
  userId?: string;
  departmentId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

export interface MonthlyUsage {
  month: number;
  year: number;
  total: number;
  used: number;
  remaining: number;
  corrections: {
    guid: string;
    correctionType: string;
    requestDate: Date | string;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }[];
}
