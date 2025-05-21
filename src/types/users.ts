// src/types/users.ts
import { UserRole } from "./enums";

export interface User {
  guid: string;
  fullName: string;
  email: string;
  nip: string;
  phoneNumber?: string;
  profileImage?: string | null;
  profileImageUrl?: string | null; // Added for frontend convenience - URL to display profile image
  role: string;
  department?: string;
  position?: string;
  isActive: boolean;
  additionalInfo?: {
    birthDate?: string;
    address?: string;
    emergencyContact?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  nip: string;
  phoneNumber?: string;
  role?: UserRole;
  department?: string;
  position?: string;
  isActive?: boolean;
  additionalInfo?: {
    birthDate?: string;
    address?: string;
    emergencyContact?: string;
  };
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  nip?: string;
  phoneNumber?: string;
  role?: UserRole;
  department?: string;
  position?: string;
  isActive?: boolean;
  additionalInfo?: {
    birthDate?: string;
    address?: string;
    emergencyContact?: string;
  };
}
