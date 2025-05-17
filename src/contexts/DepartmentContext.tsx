// src/contexts/DepartmentContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Department } from "../types/departments";
import DepartmentService from "../services/DepartmentService";
import { useAuth } from "./AuthContext";
import { UserRole } from "../types/enums";

interface DepartmentContextType {
  departments: Department[];
  userDepartments: Department[];
  selectedDepartment: Department | null;
  loading: boolean;
  error: string | null;
  fetchDepartments: () => Promise<void>;
  fetchUserDepartments: () => Promise<void>;
  fetchDepartmentById: (guid: string) => Promise<Department>;
  fetchDepartmentByName: (name: string) => Promise<Department>;
  clearSelectedDepartment: () => void;
  clearError: () => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(
  undefined
);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userDepartments, setUserDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Load user's departments when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserDepartments();
    }
  }, [isAuthenticated, user]);

  const fetchDepartments = async (): Promise<void> => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await DepartmentService.getAllDepartments();
      setDepartments(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch departments";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDepartments = async (): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      let data: Department[] = [];

      if (user.role === UserRole.ADMIN) {
        // For admin, get all departments
        data = await DepartmentService.getAllDepartments();
      } else if (user.role === UserRole.KAJUR) {
        // For department heads, get departments they lead
        data = await DepartmentService.getDepartmentsByHead(user.guid);
      } else {
        // For regular users, get departments they belong to
        data = await DepartmentService.getDepartmentsByMember(user.guid);
      }

      setUserDepartments(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch your departments";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentById = async (guid: string): Promise<Department> => {
    setLoading(true);
    setError(null);

    try {
      const data = await DepartmentService.getDepartmentById(guid);
      setSelectedDepartment(data);
      return data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch department details";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentByName = async (name: string): Promise<Department> => {
    setLoading(true);
    setError(null);

    try {
      const data = await DepartmentService.getDepartmentByName(name);
      setSelectedDepartment(data);
      return data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch department by name";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedDepartment = (): void => {
    setSelectedDepartment(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const value = {
    departments,
    userDepartments,
    selectedDepartment,
    loading,
    error,
    fetchDepartments,
    fetchUserDepartments,
    fetchDepartmentById,
    fetchDepartmentByName,
    clearSelectedDepartment,
    clearError,
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartments = (): DepartmentContextType => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error("useDepartments must be used within a DepartmentProvider");
  }
  return context;
};
