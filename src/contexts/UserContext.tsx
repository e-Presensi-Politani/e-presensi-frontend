// src/contexts/UsersContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, CreateUserDto, UpdateUserDto } from "../types/users";
import UsersService from "../services/UsersService";
import { useAuth } from "./AuthContext";

interface UsersContextType {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUserByGuid: (guid: string) => Promise<void>;
  createUser: (userData: CreateUserDto) => Promise<void>;
  updateUser: (guid: string, userData: UpdateUserDto) => Promise<void>;
  deleteUser: (guid: string) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<void>;
  removeProfilePhoto: () => Promise<void>;
  removeUserProfilePhoto: (userGuid: string) => Promise<void>;
  getProfilePhoto: (userGuid: string) => Promise<any>;
  fetchProfile: () => Promise<void>;
  clearSelectedUser: () => void;
  clearError: () => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, isAuthenticated } = useAuth();

  // Load users data if the current user is an admin or kajur
  useEffect(() => {
    if (
      isAuthenticated &&
      (currentUser?.role === "ADMIN" || currentUser?.role === "KAJUR")
    ) {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser]);

  const fetchUsers = async (): Promise<void> => {
    if (!isAuthenticated) {
      setError("Unauthorized: Only admins and kajur can view all users");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const usersData = await UsersService.getAllUsers();
      setUsers(usersData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserByGuid = async (guid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const userData = await UsersService.getUserByGuid(guid);
      setSelectedUser(userData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch user";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (): Promise<void> => {
    if (!isAuthenticated) {
      setError("Unauthorized: You must be logged in to view your profile");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileData = await UsersService.getProfile();
      setSelectedUser(profileData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserDto): Promise<void> => {
    if (!isAuthenticated || currentUser?.role !== "ADMIN") {
      setError("Unauthorized: Only admins can create users");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await UsersService.createUser(userData);
      // Refresh users list after creating a new user
      await fetchUsers();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create user";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    guid: string,
    userData: UpdateUserDto
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await UsersService.updateUser(guid, userData);

      // Update the selected user if it's the one being updated
      if (selectedUser && selectedUser.guid === guid) {
        setSelectedUser(updatedUser);
      }

      // Update the user in the users array
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.guid === guid ? updatedUser : user))
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update user";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (guid: string): Promise<void> => {
    if (!isAuthenticated || currentUser?.role !== "ADMIN") {
      setError("Unauthorized: Only admins can delete users");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await UsersService.deleteUser(guid);

      // Remove user from the list
      setUsers((prevUsers) => prevUsers.filter((user) => user.guid !== guid));

      // Clear selected user if it's the one being deleted
      if (selectedUser && selectedUser.guid === guid) {
        setSelectedUser(null);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete user";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<void> => {
    if (!isAuthenticated) {
      setError("Unauthorized: You must be logged in to upload a profile photo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await UsersService.uploadProfilePhoto(file);

      // Refresh profile to get updated photo URL
      await fetchProfile();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to upload profile photo";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeProfilePhoto = async (): Promise<void> => {
    if (!isAuthenticated) {
      setError(
        "Unauthorized: You must be logged in to remove your profile photo"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await UsersService.removeProfilePhoto();

      // Update the selected user (profile) to reflect photo removal
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          profileImage: null,
          profileImageUrl: null,
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove profile photo";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeUserProfilePhoto = async (userGuid: string): Promise<void> => {
    if (!isAuthenticated) {
      setError(
        "Unauthorized: Only admins can remove other users' profile photos"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await UsersService.removeUserProfilePhoto(userGuid);

      // Update the selected user if it's the one being modified
      if (selectedUser && selectedUser.guid === userGuid) {
        setSelectedUser({
          ...selectedUser,
          profileImage: null,
          profileImageUrl: null,
        });
      }

      // Update user in the users list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.guid === userGuid
            ? { ...user, profileImage: null, profileImageUrl: null }
            : user
        )
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove user's profile photo";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePhoto = async (userGuid: string): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const photoData = await UsersService.getProfilePhoto(userGuid);
      return photoData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to get profile photo";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedUser = (): void => {
    setSelectedUser(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const value = {
    users,
    selectedUser,
    loading,
    error,
    fetchUsers,
    fetchUserByGuid,
    createUser,
    updateUser,
    deleteUser,
    uploadProfilePhoto,
    removeProfilePhoto,
    removeUserProfilePhoto,
    getProfilePhoto,
    fetchProfile,
    clearSelectedUser,
    clearError,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
};

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
