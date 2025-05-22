// src/types/auth.ts

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role?: string;
  isActive?: boolean;
}

export interface User {
  guid: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
  department?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RefreshTokenResponse extends AuthTokens {}
