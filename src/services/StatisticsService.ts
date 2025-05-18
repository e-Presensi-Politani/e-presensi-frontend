// src/services/statisticsService.ts
import axios from "axios";
import {
  StatisticsQueryParams,
  StatisticsSummary,
  GenerateReportParams,
  GenerateReportResponse,
} from "../types/statistics";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

class StatisticsService {
  /**
   * Get statistics data based on query parameters
   * @param params Query parameters for filtering statistics
   * @returns Promise with statistics data
   */
  async getStatistics(
    params: StatisticsQueryParams
  ): Promise<StatisticsSummary> {
    try {
      const response = await axios.get(`${API}/statistics`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }

  /**
   * Get current user's statistics data based on query parameters
   * @param params Query parameters for filtering statistics
   * @returns Promise with statistics data
   */
  async getMyStatistics(
    params: StatisticsQueryParams
  ): Promise<StatisticsSummary> {
    try {
      const response = await axios.get(`${API}/statistics/my-statistics`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching my statistics:", error);
      throw error;
    }
  }

  /**
   * Generate a report (Admin/Kajur only)
   * @param data Parameters for generating the report
   * @returns Promise with report generation result
   */
  async generateReport(
    data: GenerateReportParams
  ): Promise<GenerateReportResponse> {
    try {
      const response = await axios.post(
        `${API}/statistics/generate-report`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  /**
   * Generate a report for the current user
   * @param data Parameters for generating the report
   * @returns Promise with report generation result
   */
  async generateMyReport(
    data: GenerateReportParams
  ): Promise<GenerateReportResponse> {
    try {
      const response = await axios.post(
        `${API}/statistics/generate-my-report`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating personal report:", error);
      throw error;
    }
  }

  /**
   * Get download URL for a report
   * @param fileName Name of the file to download
   * @returns Full URL for downloading the report
   */
  getDownloadUrl(fileName: string): string {
    return `${API}/statistics/download/${fileName}`;
  }

  /**
   * Trigger download of a report
   * @param downloadUrl URL to download the report from
   */
  downloadReport(downloadUrl: string): void {
    window.open(downloadUrl, "_blank");
  }
}

export default new StatisticsService();
