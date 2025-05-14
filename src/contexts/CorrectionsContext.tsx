// src/contexts/CorrectionsContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Correction,
  CreateCorrectionDto,
  UpdateCorrectionDto,
  CorrectionQueryParams,
  MonthlyUsage,
} from "../types/corrections";
import CorrectionsService from "../services/CorrectionsService";
import { useAuth } from "./AuthContext";
import { UserRole } from "../types/enums";

interface CorrectionsContextType {
  corrections: Correction[];
  pendingCorrections: Correction[];
  selectedCorrection: Correction | null;
  monthlyUsage: MonthlyUsage | null;
  loading: boolean;
  error: string | null;
  fetchCorrections: (queryParams?: CorrectionQueryParams) => Promise<void>;
  fetchMyCorrections: (queryParams?: CorrectionQueryParams) => Promise<void>;
  fetchPendingCorrections: (departmentId?: string) => Promise<void>;
  fetchPendingByDepartment: (departmentId: string) => Promise<void>; // Legacy method
  fetchCorrectionById: (guid: string) => Promise<Correction>;
  createCorrection: (correctionData: CreateCorrectionDto) => Promise<void>;
  reviewCorrection: (
    guid: string,
    reviewData: UpdateCorrectionDto
  ) => Promise<void>;
  fetchMonthlyUsage: () => Promise<void>;
  clearSelectedCorrection: () => void;
  clearError: () => void;
}

const CorrectionsContext = createContext<CorrectionsContextType | undefined>(
  undefined
);

export const CorrectionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [pendingCorrections, setPendingCorrections] = useState<Correction[]>(
    []
  );
  const [selectedCorrection, setSelectedCorrection] =
    useState<Correction | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Load user's corrections when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyCorrections();
      fetchMonthlyUsage();
    }
  }, [isAuthenticated, user]);

  const fetchCorrections = async (
    queryParams?: CorrectionQueryParams
  ): Promise<void> => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await CorrectionsService.getAllCorrections(queryParams);
      setCorrections(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch corrections";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCorrections = async (
    queryParams?: CorrectionQueryParams
  ): Promise<void> => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await CorrectionsService.getMyCorrections(queryParams);
      setCorrections(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch your corrections";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCorrections = async (
    departmentId?: string
  ): Promise<void> => {
    if (
      !isAuthenticated ||
      (user?.role !== UserRole.KAJUR && user?.role !== "ADMIN")
    ) {
      setError(
        "Unauthorized: Only department heads can view pending corrections"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await CorrectionsService.getPendingCorrections(departmentId);
      setPendingCorrections(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch pending corrections";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Legacy method - kept for compatibility
  const fetchPendingByDepartment = async (
    departmentId: string
  ): Promise<void> => {
    if (
      !isAuthenticated ||
      (user?.role !== UserRole.KAJUR && user?.role !== "ADMIN")
    ) {
      setError(
        "Unauthorized: Only department heads can view pending corrections"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await CorrectionsService.getPendingByDepartment(
        departmentId
      );
      setPendingCorrections(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch pending corrections";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrectionById = async (guid: string): Promise<Correction> => {
    setLoading(true);
    setError(null);

    try {
      const data = await CorrectionsService.getCorrectionById(guid);
      setSelectedCorrection(data);
      return data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch correction details";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createCorrection = async (
    correctionData: CreateCorrectionDto
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const newCorrection = await CorrectionsService.createCorrection(
        correctionData
      );

      // Update the corrections list with the new one
      setCorrections((prevCorrections) => [newCorrection, ...prevCorrections]);

      // Update monthly usage
      await fetchMonthlyUsage();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create correction request";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reviewCorrection = async (
    guid: string,
    reviewData: UpdateCorrectionDto
  ): Promise<void> => {
    if (
      !isAuthenticated ||
      (user?.role !== UserRole.KAJUR && user?.role !== "ADMIN")
    ) {
      setError("Unauthorized: Only department heads can review corrections");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedCorrection = await CorrectionsService.reviewCorrection(
        guid,
        reviewData
      );

      // Update the selected correction if it's the one being reviewed
      if (selectedCorrection && selectedCorrection.guid === guid) {
        setSelectedCorrection(updatedCorrection);
      }

      // Update corrections list
      setCorrections((prevCorrections) =>
        prevCorrections.map((correction) =>
          correction.guid === guid ? updatedCorrection : correction
        )
      );

      // Update pending corrections list
      setPendingCorrections((prevPendingCorrections) =>
        prevPendingCorrections.filter((correction) => correction.guid !== guid)
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to review correction";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyUsage = async (): Promise<void> => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await CorrectionsService.getMonthlyUsage();
      setMonthlyUsage(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch monthly usage";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedCorrection = (): void => {
    setSelectedCorrection(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const value = {
    corrections,
    pendingCorrections,
    selectedCorrection,
    monthlyUsage,
    loading,
    error,
    fetchCorrections,
    fetchMyCorrections,
    fetchPendingCorrections,
    fetchPendingByDepartment, // Legacy method
    fetchCorrectionById,
    createCorrection,
    reviewCorrection,
    fetchMonthlyUsage,
    clearSelectedCorrection,
    clearError,
  };

  return (
    <CorrectionsContext.Provider value={value}>
      {children}
    </CorrectionsContext.Provider>
  );
};

export const useCorrections = (): CorrectionsContextType => {
  const context = useContext(CorrectionsContext);
  if (context === undefined) {
    throw new Error("useCorrections must be used within a CorrectionsProvider");
  }
  return context;
};
