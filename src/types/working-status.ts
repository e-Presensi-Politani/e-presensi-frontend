// src/types/WorkingStatusIndonesia.ts
import { WorkingStatus } from "./enums";

export enum WorkingStatusIndonesia {
  HADIR = "Hadir",
  TIDAK_HADIR = "Tidak Hadir",
  TERLAMBAT = "Terlambat",
  JAM_KERJA_KURANG = "Jam Kerja Kurang",
  KERJA_REMOTE = "Kerja Remote",
  CUTI = "Cuti",
  DINAS_LUAR = "Dinas Luar",
}

// Mapping dari WorkingStatus enum ke WorkingStatusIndonesia
export const WorkingStatusLabels: Record<WorkingStatus, string> = {
  [WorkingStatus.PRESENT]: "Hadir",
  [WorkingStatus.ABSENT]: "Tidak Hadir",
  [WorkingStatus.LATE]: "Terlambat",
  [WorkingStatus.EARLY_DEPARTURE]: "Jam Kerja Kurang",
  [WorkingStatus.REMOTE_WORKING]: "Kerja Remote",
  [WorkingStatus.ON_LEAVE]: "Cuti",
  [WorkingStatus.OFFICIAL_TRAVEL]: "Dinas Luar",
};

// Helper untuk warna status badge (mengikuti pola dari leave-request-enums.ts)
export const WorkingStatusColors: Record<WorkingStatus, string> = {
  [WorkingStatus.PRESENT]: "success",
  [WorkingStatus.ABSENT]: "error",
  [WorkingStatus.LATE]: "warning",
  [WorkingStatus.EARLY_DEPARTURE]: "warning",
  [WorkingStatus.REMOTE_WORKING]: "info",
  [WorkingStatus.ON_LEAVE]: "info",
  [WorkingStatus.OFFICIAL_TRAVEL]: "info",
};

// Fungsi untuk konversi dari WorkingStatus ke WorkingStatusIndonesia
export function convertToIndonesianStatus(status: string): string {
  switch (status) {
    case "present":
      return WorkingStatusIndonesia.HADIR;
    case "absent":
      return WorkingStatusIndonesia.TIDAK_HADIR;
    case "late":
      return WorkingStatusIndonesia.TERLAMBAT;
    case "early_departure":
      return WorkingStatusIndonesia.JAM_KERJA_KURANG;
    case "remote_working":
      return WorkingStatusIndonesia.KERJA_REMOTE;
    case "on_leave":
      return WorkingStatusIndonesia.CUTI;
    case "official_travel":
      return WorkingStatusIndonesia.DINAS_LUAR;
    default:
      return status;
  }
}
