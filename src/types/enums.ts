// src/types/enums.ts
export enum UserRole {
  ADMIN = "admin",
  DOSEN = "dosen",
  KAJUR = "kajur",
}

export enum WorkingStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EARLY_DEPARTURE = "early_departure",
  REMOTE_WORKING = "remote_working",
  ON_LEAVE = "on_leave",
  OFFICIAL_TRAVEL = "official_travel",
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
  CSV = 'csv',
}