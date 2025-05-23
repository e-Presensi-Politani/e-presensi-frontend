// src/contexts/AttendanceContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Attendance,
  CheckInDto,
  CheckOutDto,
  VerifyAttendanceDto,
  AttendanceQueryParams,
  AttendanceSummary,
} from "../types/attendance";
import AttendanceService from "../services/AttendanceService";
import { useAuth } from "./AuthContext";
import { UserRole } from "../types/enums";

interface AttendanceContextType {
  todayAttendance: Attendance | null;
  attendanceRecords: Attendance[];
  selectedAttendance: Attendance | null;
  attendanceSummary: AttendanceSummary | null;
  loading: boolean;
  error: string | null;

  checkIn: (checkInData: CheckInDto, photo?: File) => Promise<void>;
  checkOut: (checkOutData: CheckOutDto, photo?: File) => Promise<void>;
  fetchTodayAttendance: () => Promise<void>;
  fetchAttendanceRecords: (params: AttendanceQueryParams) => Promise<void>;
  fetchMyAttendanceRecords: (params: AttendanceQueryParams) => Promise<void>;
  fetchAttendanceById: (guid: string) => Promise<void>;
  verifyAttendance: (
    guid: string,
    verifyData: VerifyAttendanceDto
  ) => Promise<void>;
  fetchAttendanceSummary: (
    startDate: string,
    endDate: string,
    userId?: string,
    departmentId?: string
  ) => Promise<void>;
  fetchMyAttendanceSummary: (
    startDate: string,
    endDate: string
  ) => Promise<void>;
  clearSelectedAttendance: () => void;
  clearError: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(
    null
  );
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Cache to store fetched attendance records by guid
  const [attendanceCache, setAttendanceCache] = useState<{
    [key: string]: Attendance;
  }>({});

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayAttendance();
    }
  }, [isAuthenticated]);

  const checkIn = async (
    checkInData: CheckInDto,
    photo?: File
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const attendance = await AttendanceService.checkIn(checkInData, photo);
      setTodayAttendance(attendance);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Check-in failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async (
    checkOutData: CheckOutDto,
    photo?: File
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const attendance = await AttendanceService.checkOut(checkOutData, photo);
      setTodayAttendance(attendance);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Check-out failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const attendance = await AttendanceService.getTodayAttendance();
      setTodayAttendance(attendance);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch today's attendance";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (
    params: AttendanceQueryParams
  ): Promise<void> => {
    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.KAJUR)
    ) {
      setError(
        "Unauthorized: Only admins and department heads can view all attendance records"
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const records = await AttendanceService.getAllAttendance(params);
      setAttendanceRecords(records);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch attendance records";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttendanceRecords = useCallback(
    async (params: AttendanceQueryParams): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const records = await AttendanceService.getMyAttendance(params);
        setAttendanceRecords(records);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to fetch your attendance records";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAttendanceById = useCallback(
    async (guid: string): Promise<void> => {
      // Check if the attendance record is already in the cache
      if (attendanceCache[guid]) {
        setSelectedAttendance(attendanceCache[guid]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const attendance = await AttendanceService.getAttendanceById(guid);
        // Store the fetched attendance in the cache
        setAttendanceCache((prevCache) => ({
          ...prevCache,
          [guid]: attendance,
        }));
        setSelectedAttendance(attendance);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch attendance details";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [attendanceCache]
  );

  const verifyAttendance = async (
    guid: string,
    verifyData: VerifyAttendanceDto
  ): Promise<void> => {
    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.KAJUR)
    ) {
      setError(
        "Unauthorized: Only admins and department heads can verify attendance"
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedAttendance = await AttendanceService.verifyAttendance(
        guid,
        verifyData
      );
      // Update the cache
      setAttendanceCache((prevCache) => ({
        ...prevCache,
        [guid]: updatedAttendance,
      }));
      if (selectedAttendance && selectedAttendance.guid === guid) {
        setSelectedAttendance(updatedAttendance);
      }
      setAttendanceRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.guid === guid ? updatedAttendance : record
        )
      );
      if (todayAttendance && todayAttendance.guid === guid) {
        setTodayAttendance(updatedAttendance);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to verify attendance";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async (
    startDate: string,
    endDate: string,
    userId?: string,
    departmentId?: string
  ): Promise<void> => {
    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.KAJUR)
    ) {
      setError(
        "Unauthorized: Only admins and department heads can view attendance summaries"
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const summary = await AttendanceService.getAttendanceSummary(
        startDate,
        endDate,
        userId,
        departmentId
      );
      setAttendanceSummary(summary);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch attendance summary";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttendanceSummary = async (
    startDate: string,
    endDate: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const summary = await AttendanceService.getMyAttendanceSummary(
        startDate,
        endDate
      );
      setAttendanceSummary(summary);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to fetch your attendance summary";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedAttendance = (): void => {
    setSelectedAttendance(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const value = {
    todayAttendance,
    attendanceRecords,
    selectedAttendance,
    attendanceSummary,
    loading,
    error,
    checkIn,
    checkOut,
    fetchTodayAttendance,
    fetchAttendanceRecords,
    fetchMyAttendanceRecords,
    fetchAttendanceById,
    verifyAttendance,
    fetchAttendanceSummary,
    fetchMyAttendanceSummary,
    clearSelectedAttendance,
    clearError,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};
