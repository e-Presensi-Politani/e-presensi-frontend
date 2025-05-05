// src/types/statistics.ts
import { ReportPeriod, ReportFormat } from "./enums";

export interface StatisticsQueryParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
  departmentId?: string;
  period?: ReportPeriod;
  includeInactive?: boolean;
}

export interface GenerateReportParams {
  format: ReportFormat;
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  userId?: string;
  departmentId?: string;
  title?: string;
}

export interface ReportResponse {
  success: boolean;
  message: string;
  data: {
    fileName: string;
    downloadUrl: string;
  };
}

export interface AttendanceRecord {
  guid: string;
  userId: string;
  departmentId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: number;
  status: string;
  checkInLocation?: string;
  checkInNotes?: string;
  verified: boolean;
}

export interface StatisticsSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  earlyDeparture: number;
  remoteWorking: number;
  onLeave: number;
  officialTravel: number;
  totalWorkHours: number;
  averageWorkHours: number;
  totalAttendances: number;
  records: AttendanceRecord[];
}
