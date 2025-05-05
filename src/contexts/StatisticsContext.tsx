// src/contexts/StatisticsContext.tsx
import React, { createContext, useContext, useState } from "react";
import StatisticsService from "../services/StatisticsService";
import { useAuth } from "./AuthContext";
import {
  StatisticsQueryParams,
  StatisticsSummary,
  GenerateReportParams,
  ReportResponse,
} from "../types/statistics";
import { ReportPeriod } from "../types/enums";

interface StatisticsContextType {
  statistics: StatisticsSummary | null;
  loading: boolean;
  error: string | null;
  reportGenerated: ReportResponse | null;
  getStatistics: (queryParams: StatisticsQueryParams) => Promise<void>;
  getMyStatistics: (queryParams: StatisticsQueryParams) => Promise<void>;
  generateReport: (params: GenerateReportParams) => Promise<void>;
  generateMyReport: (params: GenerateReportParams) => Promise<void>;
  getReportDownloadUrl: (fileName: string) => string;
  clearStatistics: () => void;
  clearError: () => void;
  clearReportGenerated: () => void;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(
  undefined
);

export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [statistics, setStatistics] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reportGenerated, setReportGenerated] = useState<ReportResponse | null>(
    null
  );
  const { user, isAuthenticated } = useAuth();

  const getStatistics = async (
    queryParams: StatisticsQueryParams
  ): Promise<void> => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }

    if (user?.role !== "ADMIN" && user?.role !== "kajur") {
      setError("Unauthorized: Only admin or kajur can access all statistics");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await StatisticsService.getStatistics(queryParams);
      setStatistics(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch statistics";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMyStatistics = async (
    queryParams: StatisticsQueryParams
  ): Promise<void> => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await StatisticsService.getMyStatistics(queryParams);
      setStatistics(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch personal statistics";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (
    params: GenerateReportParams
  ): Promise<void> => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }

    if (user?.role !== "ADMIN" && user?.role !== "kajur") {
      setError(
        "Unauthorized: Only admin or kajur can generate department reports"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await StatisticsService.generateReport(params);
      setReportGenerated(response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to generate report";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateMyReport = async (
    params: GenerateReportParams
  ): Promise<void> => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await StatisticsService.generateMyReport(params);
      setReportGenerated(response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to generate personal report";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getReportDownloadUrl = (fileName: string): string => {
    return StatisticsService.getReportDownloadUrl(fileName);
  };

  const clearStatistics = (): void => {
    setStatistics(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const clearReportGenerated = (): void => {
    setReportGenerated(null);
  };

  const value = {
    statistics,
    loading,
    error,
    reportGenerated,
    getStatistics,
    getMyStatistics,
    generateReport,
    generateMyReport,
    getReportDownloadUrl,
    clearStatistics,
    clearError,
    clearReportGenerated,
  };

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};

export const useStatistics = (): StatisticsContextType => {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error("useStatistics must be used within a StatisticsProvider");
  }
  return context;
};
