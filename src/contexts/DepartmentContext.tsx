// src/contexts/DepartmentContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  AssignHeadDto,
  AddMembersDto,
} from "../types/departments";
import DepartmentService from "../services/DepartmentService";
import { useAuth } from "./AuthContext";
import { UserRole } from "../types/enums";

interface DepartmentContextType {
  // State
  departments: Department[];
  selectedDepartment: Department | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDepartments: () => Promise<void>;
  fetchDepartmentsWithInactive: () => Promise<void>;
  fetchDepartmentByGuid: (guid: string) => Promise<void>;
  fetchDepartmentByCode: (code: string) => Promise<void>;
  createDepartment: (departmentData: CreateDepartmentDto) => Promise<void>;
  updateDepartment: (
    guid: string,
    departmentData: UpdateDepartmentDto
  ) => Promise<void>;
  deleteDepartment: (guid: string) => Promise<void>;
  hardDeleteDepartment: (guid: string) => Promise<void>;
  assignDepartmentHead: (
    guid: string,
    headData: AssignHeadDto
  ) => Promise<void>;
  addDepartmentMembers: (
    guid: string,
    membersData: AddMembersDto
  ) => Promise<void>;
  removeDepartmentMembers: (
    guid: string,
    membersData: AddMembersDto
  ) => Promise<void>;
  fetchDepartmentsByMember: (userId: string) => Promise<void>;
  fetchDepartmentByHead: (userId: string) => Promise<void>;
  clearSelectedDepartment: () => void;
  clearError: () => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(
  undefined
);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State variables
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  // Load departments when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDepartments();
    }
  }, [isAuthenticated]);

  const fetchDepartments = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const departmentsData = await DepartmentService.getAllDepartments();
      setDepartments(departmentsData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch departments";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsWithInactive = async (): Promise<void> => {
    // Check if user has admin permission
    if (!user || user.role !== UserRole.ADMIN) {
      setError("Unauthorized: Only admins can view inactive departments");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const departmentsData = await DepartmentService.getAllWithInactive();
      setDepartments(departmentsData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch all departments";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentByGuid = async (guid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const department = await DepartmentService.getDepartmentByGuid(guid);
      setSelectedDepartment(department);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch department details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentByCode = async (code: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const department = await DepartmentService.getDepartmentByCode(code);
      setSelectedDepartment(department);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch department by code";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (
    departmentData: CreateDepartmentDto
  ): Promise<void> => {
    // Check if user has admin permission
    if (!user || user.role !== UserRole.ADMIN) {
      setError("Unauthorized: Only admins can create departments");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newDepartment = await DepartmentService.createDepartment(
        departmentData
      );
      setDepartments([...departments, newDepartment]);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create department";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (
    guid: string,
    departmentData: UpdateDepartmentDto
  ): Promise<void> => {
    // Check if user has admin permission
    if (!user || user.role !== UserRole.ADMIN) {
      setError("Unauthorized: Only admins can update departments");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedDepartment = await DepartmentService.updateDepartment(
        guid,
        departmentData
      );

      // Update selected department if it's the one being updated
      if (selectedDepartment && selectedDepartment.guid === guid) {
        setSelectedDepartment(updatedDepartment);
      }

      // Update the department in the departments array
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.guid === guid ? updatedDepartment : dept
        )
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update department";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (guid: string): Promise<void> => {
    // Check if user has admin permission
    if (!user || user.role !== UserRole.ADMIN) {
      setError("Unauthorized: Only admins can delete departments");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedDepartment = await DepartmentService.deleteDepartment(guid);

      // Update selected department if it's the one being deleted
      if (selectedDepartment && selectedDepartment.guid === guid) {
        setSelectedDepartment(updatedDepartment);
      }

      // Update the department in the departments array
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.guid === guid ? updatedDepartment : dept
        )
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete department";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const hardDeleteDepartment = async (guid: string): Promise<void> => {
    // Check if user has admin permission
    if (!user || user.role !== UserRole.ADMIN) {
      setError("Unauthorized: Only admins can permanently delete departments");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await DepartmentService.hardDeleteDepartment(guid);

      // Remove department from the list
      setDepartments((prevDepartments) =>
        prevDepartments.filter((dept) => dept.guid !== guid)
      );

      // Clear selected department if it's the one being deleted
      if (selectedDepartment && selectedDepartment.guid === guid) {
        setSelectedDepartment(null);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to permanently delete department";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignDepartmentHead = async (
    guid: string,
    headData: AssignHeadDto
  ): Promise<void> => {
    // Check if user has admin permission
    if (!user || user.role !== UserRole.ADMIN) {
      setError("Unauthorized: Only admins can assign department heads");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedDepartment = await DepartmentService.assignDepartmentHead(
        guid,
        headData
      );

      // Update selected department if it's the one being updated
      if (selectedDepartment && selectedDepartment.guid === guid) {
        setSelectedDepartment(updatedDepartment);
      }

      // Update the department in the departments array
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.guid === guid ? updatedDepartment : dept
        )
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to assign department head";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addDepartmentMembers = async (
    guid: string,
    membersData: AddMembersDto
  ): Promise<void> => {
    // Check if user has permission (admin or department head)
    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.KAJUR)
    ) {
      setError(
        "Unauthorized: Only admins and department heads can add members"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedDepartment = await DepartmentService.addDepartmentMembers(
        guid,
        membersData
      );

      // Update selected department if it's the one being updated
      if (selectedDepartment && selectedDepartment.guid === guid) {
        setSelectedDepartment(updatedDepartment);
      }

      // Update the department in the departments array
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.guid === guid ? updatedDepartment : dept
        )
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to add department members";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeDepartmentMembers = async (
    guid: string,
    membersData: AddMembersDto
  ): Promise<void> => {
    // Check if user has permission (admin or department head)
    if (
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.KAJUR)
    ) {
      setError(
        "Unauthorized: Only admins and department heads can remove members"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedDepartment = await DepartmentService.removeDepartmentMembers(
        guid,
        membersData
      );

      // Update selected department if it's the one being updated
      if (selectedDepartment && selectedDepartment.guid === guid) {
        setSelectedDepartment(updatedDepartment);
      }

      // Update the department in the departments array
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.guid === guid ? updatedDepartment : dept
        )
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove department members";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsByMember = async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const departmentsData = await DepartmentService.getDepartmentsByMember(
        userId
      );
      setDepartments(departmentsData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch departments by member";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentByHead = async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const departmentsData = await DepartmentService.getDepartmentByHead(
        userId
      );
      setDepartments(departmentsData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch departments by head";
      setError(errorMessage);
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
    // State
    departments,
    selectedDepartment,
    loading,
    error,

    // Actions
    fetchDepartments,
    fetchDepartmentsWithInactive,
    fetchDepartmentByGuid,
    fetchDepartmentByCode,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    hardDeleteDepartment,
    assignDepartmentHead,
    addDepartmentMembers,
    removeDepartmentMembers,
    fetchDepartmentsByMember,
    fetchDepartmentByHead,
    clearSelectedDepartment,
    clearError,
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = (): DepartmentContextType => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error("useDepartment must be used within a DepartmentProvider");
  }
  return context;
};
