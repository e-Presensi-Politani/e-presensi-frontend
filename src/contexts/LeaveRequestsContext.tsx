// src/contexts/LeaveRequestsContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  LeaveRequest,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ReviewLeaveRequestDto,
  QueryLeaveRequestsDto,
} from "../types/leave-requests";
import LeaveRequestsService from "../services/LeaveRequestsService";
import { useAuth } from "./AuthContext";
import { UserRole } from "../types/enums";

interface LeaveRequestsContextType {
  leaveRequests: LeaveRequest[];
  pendingRequests: LeaveRequest[];
  myRequests: LeaveRequest[];
  selectedRequest: LeaveRequest | null;
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchLeaveRequests: (query?: QueryLeaveRequestsDto) => Promise<void>;
  fetchPendingRequests: (departmentId?: string) => Promise<void>;
  fetchMyRequests: () => Promise<void>;
  fetchLeaveRequestByGuid: (guid: string) => Promise<void>;
  createLeaveRequest: (
    data: CreateLeaveRequestDto,
    attachmentFile: File
  ) => Promise<void>;
  updateLeaveRequest: (
    guid: string,
    data: UpdateLeaveRequestDto,
    attachmentFile?: File
  ) => Promise<void>;
  deleteLeaveRequest: (guid: string) => Promise<void>;
  reviewLeaveRequest: (
    guid: string,
    reviewData: ReviewLeaveRequestDto
  ) => Promise<void>;

  // Helper functions
  clearSelectedRequest: () => void;
  clearError: () => void;
  getAttachmentDownloadUrl: (guid: string) => string;
}

const LeaveRequestsContext = createContext<
  LeaveRequestsContextType | undefined
>(undefined);

export const LeaveRequestsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  // Load data based on user role when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load my requests for all users
      fetchMyRequests();

      // Load pending requests for department heads and admins
      if (user.role === UserRole.ADMIN || user.role === UserRole.KAJUR) {
        fetchPendingRequests();
      }
    }
  }, [isAuthenticated, user]);

  const fetchLeaveRequests = async (
    query?: QueryLeaveRequestsDto
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await LeaveRequestsService.getAllLeaveRequests(query);
      setLeaveRequests(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch leave requests";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async (departmentId?: string): Promise<void> => {
    if (
      !isAuthenticated ||
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.KAJUR)
    ) {
      setError(
        "Unauthorized: Only department heads and admins can view pending requests"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await LeaveRequestsService.getPendingLeaveRequests(
        departmentId
      );
      setPendingRequests(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch pending requests";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async (): Promise<void> => {
    if (!isAuthenticated) {
      setError("You must be logged in to view your requests");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await LeaveRequestsService.getMyLeaveRequests();
      setMyRequests(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch your requests";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequestByGuid = async (guid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await LeaveRequestsService.getLeaveRequestByGuid(guid);
      setSelectedRequest(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch leave request details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createLeaveRequest = async (
    data: CreateLeaveRequestDto,
    attachmentFile: File
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await LeaveRequestsService.createLeaveRequest(data, attachmentFile);

      // Refresh my requests after creating a new request
      await fetchMyRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create leave request";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveRequest = async (
    guid: string,
    data: UpdateLeaveRequestDto,
    attachmentFile?: File
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const updatedRequest = await LeaveRequestsService.updateLeaveRequest(
        guid,
        data,
        attachmentFile
      );

      // Update the selected request if it's the one being updated
      if (selectedRequest && selectedRequest.guid === guid) {
        setSelectedRequest(updatedRequest);
      }

      // Update the request in the lists
      const updateRequestInList = (list: LeaveRequest[]) =>
        list.map((req) => (req.guid === guid ? updatedRequest : req));

      setLeaveRequests(updateRequestInList(leaveRequests));
      setMyRequests(updateRequestInList(myRequests));
      setPendingRequests(
        pendingRequests.filter((req) => req.guid !== guid) // Remove from pending if updated
      );

      // Refresh the relevant list based on context
      await fetchMyRequests();

      if (user?.role === UserRole.ADMIN || user?.role === UserRole.KAJUR) {
        await fetchPendingRequests();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update leave request";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteLeaveRequest = async (guid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await LeaveRequestsService.deleteLeaveRequest(guid);

      // Remove request from all lists
      setLeaveRequests(leaveRequests.filter((req) => req.guid !== guid));
      setMyRequests(myRequests.filter((req) => req.guid !== guid));
      setPendingRequests(pendingRequests.filter((req) => req.guid !== guid));

      // Clear selected request if it's the one being deleted
      if (selectedRequest && selectedRequest.guid === guid) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete leave request";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reviewLeaveRequest = async (
    guid: string,
    reviewData: ReviewLeaveRequestDto
  ): Promise<void> => {
    if (
      !isAuthenticated ||
      !user ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.KAJUR)
    ) {
      setError(
        "Unauthorized: Only department heads and admins can review requests"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedRequest = await LeaveRequestsService.reviewLeaveRequest(
        guid,
        reviewData
      );

      // Update the selected request if it's the one being reviewed
      if (selectedRequest && selectedRequest.guid === guid) {
        setSelectedRequest(updatedRequest);
      }

      // Update the request in the lists and remove from pending
      const updateRequestInList = (list: LeaveRequest[]) =>
        list.map((req) => (req.guid === guid ? updatedRequest : req));

      setLeaveRequests(updateRequestInList(leaveRequests));
      setMyRequests(updateRequestInList(myRequests));
      setPendingRequests(pendingRequests.filter((req) => req.guid !== guid));

      // Refresh pending requests
      await fetchPendingRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to review leave request";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedRequest = (): void => {
    setSelectedRequest(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const getAttachmentDownloadUrl = (guid: string): string => {
    return LeaveRequestsService.getAttachmentDownloadUrl(guid);
  };

  const value = {
    leaveRequests,
    pendingRequests,
    myRequests,
    selectedRequest,
    loading,
    error,
    fetchLeaveRequests,
    fetchPendingRequests,
    fetchMyRequests,
    fetchLeaveRequestByGuid,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    reviewLeaveRequest,
    clearSelectedRequest,
    clearError,
    getAttachmentDownloadUrl,
  };

  return (
    <LeaveRequestsContext.Provider value={value}>
      {children}
    </LeaveRequestsContext.Provider>
  );
};

export const useLeaveRequests = (): LeaveRequestsContextType => {
  const context = useContext(LeaveRequestsContext);
  if (context === undefined) {
    throw new Error(
      "useLeaveRequests must be used within a LeaveRequestsProvider"
    );
  }
  return context;
};
