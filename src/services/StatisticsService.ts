// src/services/StatisticsService.ts
import api from "./api";
import {
  StatisticsQueryParams,
  StatisticsSummary,
  GenerateReportParams,
  ReportResponse,
} from "../types/statistics";

class StatisticsService {
  /**
   * Get statistics based on query parameters
   * @param queryParams Parameters to filter statistics
   * @returns Promise with statistics data
   */
  async getStatistics(
    queryParams: StatisticsQueryParams
  ): Promise<StatisticsSummary> {
    const response = await api.get("/statistics", { params: queryParams });
    return response.data;
  }

  /**
   * Get personal statistics for the current user
   * @param queryParams Parameters to filter statistics
   * @returns Promise with statistics data
   */
  async getMyStatistics(
    queryParams: StatisticsQueryParams
  ): Promise<StatisticsSummary> {
    const response = await api.get("/statistics/my-statistics", {
      params: queryParams,
    });
    return response.data;
  }

  /**
   * Generate a report with the specified format and parameters
   * @param params Report generation parameters
   * @returns Promise with report data
   */
  async generateReport(params: GenerateReportParams): Promise<ReportResponse> {
    const response = await api.post("/statistics/generate-report", params);
    return response.data;
  }

  /**
   * Generate a personal report for the current user
   * @param params Report generation parameters
   * @returns Promise with report data
   */
  async generateMyReport(
    params: GenerateReportParams
  ): Promise<ReportResponse> {
    const response = await api.post("/statistics/generate-my-report", params);
    return response.data;
  }

  /**
   * Get the download URL for a specific report
   * @param fileName Name of the report file
   * @returns Full URL for downloading the report
   */
  getReportDownloadUrl(fileName: string): string {
    return `${api.defaults.baseURL}/statistics/download/${fileName}`;
  }
}

export default new StatisticsService();
