// src/types/corrections.ts
export interface Correction {
  guid: string;
  userId: string;
  departmentId: string;
  attendanceId: string;
  type: string;
  requestDate: Date | string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCorrectionDto {
  attendanceId: string;
  type: string;
  date: Date | string;
  reason: string;
}

export interface UpdateCorrectionDto {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
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

export const CORRECTION_TYPE_LABELS: Record<CorrectionType, string> = {
  [CorrectionType.BREAK_TIME_AS_WORK]:
    "Penggunaan Jam Istirahat sebagai Jam Kerja",
  [CorrectionType.EARLY_DEPARTURE]: "Izin Cepat Pulang",
  [CorrectionType.LATE_ARRIVAL]: "Izin Terlambat Datang",
  [CorrectionType.MISSED_CHECK_IN]: "Lupa Absen Masuk",
  [CorrectionType.MISSED_CHECK_OUT]: "Lupa Absen Pulang",
};

export const CORRECTION_STATUS_LABELS: Record<CorrectionStatus, string> = {
  [CorrectionStatus.PENDING]: "Menunggu Persetujuan",
  [CorrectionStatus.APPROVED]: "Disetujui",
  [CorrectionStatus.REJECTED]: "Ditolak",
};
