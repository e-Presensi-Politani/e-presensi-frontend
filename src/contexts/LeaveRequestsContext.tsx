// LeaveRequestsContext.tsx
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

  // Cache for recently fetched requests
  const requestCache = new Map<string, LeaveRequest>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyRequests();
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
    // Check cache first
    const cachedRequest = requestCache.get(guid);
    if (cachedRequest) {
      setSelectedRequest(cachedRequest);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await LeaveRequestsService.getLeaveRequestByGuid(guid);
      setSelectedRequest(data);
      // Store in cache with timestamp
      requestCache.set(guid, data);
      // Clean up cache after duration
      setTimeout(() => requestCache.delete(guid), CACHE_DURATION);
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
      if (selectedRequest && selectedRequest.guid === guid) {
        setSelectedRequest(updatedRequest);
      }
      const updateRequestInList = (list: LeaveRequest[]) =>
        list.map((req) => (req.guid === guid ? updatedRequest : req));
      setLeaveRequests(updateRequestInList(leaveRequests));
      setMyRequests(updateRequestInList(myRequests));
      setPendingRequests(pendingRequests.filter((req) => req.guid !== guid));
      await fetchMyRequests();
      if (user?.role === UserRole.ADMIN || user?.role === UserRole.KAJUR) {
        await fetchPendingRequests();
      }
      // Update cache
      requestCache.set(guid, updatedRequest);
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
      setLeaveRequests(leaveRequests.filter((req) => req.guid !== guid));
      setMyRequests(myRequests.filter((req) => req.guid !== guid));
      setPendingRequests(pendingRequests.filter((req) => req.guid !== guid));
      if (selectedRequest && selectedRequest.guid === guid) {
        setSelectedRequest(null);
      }
      // Remove from cache
      requestCache.delete(guid);
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
      if (selectedRequest && selectedRequest.guid === guid) {
        setSelectedRequest(updatedRequest);
      }
      const updateRequestInList = (list: LeaveRequest[]) =>
        list.map((req) => (req.guid === guid ? updatedRequest : req));
      setLeaveRequests(updateRequestInList(leaveRequests));
      setMyRequests(updateRequestInList(myRequests));
      setPendingRequests(pendingRequests.filter((req) => req.guid !== guid));
      await fetchPendingRequests();
      // Update cache
      requestCache.set(guid, updatedRequest);
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
