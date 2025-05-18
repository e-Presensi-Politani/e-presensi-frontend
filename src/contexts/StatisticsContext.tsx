// src/contexts/StatisticsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  StatisticsQueryParams,
  StatisticsSummary,
  GenerateReportParams,
  GenerateReportResponse,
} from "../types/statistics";
import statisticsService from "../services/StatisticsService";

interface StatisticsContextType {
  statistics: StatisticsSummary | null;
  loading: boolean;
  error: string | null;
  fetchStatistics: (params: StatisticsQueryParams) => Promise<void>;
  fetchMyStatistics: (params: StatisticsQueryParams) => Promise<void>;
  generateReport: (
    params: GenerateReportParams
  ) => Promise<GenerateReportResponse>;
  generateMyReport: (
    params: GenerateReportParams
  ) => Promise<GenerateReportResponse>;
  downloadReport: (downloadUrl: string) => void;
  clearError: () => void;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(
  undefined
);

export const useStatistics = (): StatisticsContextType => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error("useStatistics must be used within a StatisticsProvider");
  }
  return context;
};

interface StatisticsProviderProps {
  children: ReactNode;
}

export const StatisticsProvider: React.FC<StatisticsProviderProps> = ({
  children,
}) => {
  const [statistics, setStatistics] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async (params: StatisticsQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await statisticsService.getStatistics(params);
      setStatistics(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch statistics data"
      );
      console.error("Error fetching statistics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyStatistics = useCallback(
    async (params: StatisticsQueryParams) => {
      setLoading(true);
      setError(null);
      try {
        const data = await statisticsService.getMyStatistics(params);
        setStatistics(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch personal statistics data"
        );
        console.error("Error fetching personal statistics:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateReport = useCallback(async (params: GenerateReportParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await statisticsService.generateReport(params);
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to generate report";
      setError(errorMessage);
      console.error("Error generating report:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMyReport = useCallback(async (params: GenerateReportParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await statisticsService.generateMyReport(params);
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to generate personal report";
      setError(errorMessage);
      console.error("Error generating personal report:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReport = useCallback((downloadUrl: string) => {
    statisticsService.downloadReport(downloadUrl);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    statistics,
    loading,
    error,
    fetchStatistics,
    fetchMyStatistics,
    generateReport,
    generateMyReport,
    downloadReport,
    clearError,
  };

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};
