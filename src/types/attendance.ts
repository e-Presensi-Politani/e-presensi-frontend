// src/types/attendance.ts
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  provider?: string;
}

export interface Attendance {
  guid: string;
  userId: string;
  date: Date;
  checkInTime?: Date;
  checkInLocation?: GeoLocation;
  checkInPhotoId?: string;
  checkInNotes?: string;
  checkOutTime?: Date;
  checkOutLocation?: GeoLocation;
  checkOutPhotoId?: string;
  checkOutNotes?: string;
  workHours?: number;
  status: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckInDto {
  latitude: number;
  longitude: number;
  accuracy?: number;
  provider?: string;
  notes?: string;
}

export interface CheckOutDto {
  latitude: number;
  longitude: number;
  accuracy?: number;
  provider?: string;
  notes?: string;
}

export interface VerifyAttendanceDto {
  verified: boolean;
}

export interface AttendanceQueryParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
  departmentId?: string;
  status?: string;
}

export interface AttendanceSummary {
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
}
