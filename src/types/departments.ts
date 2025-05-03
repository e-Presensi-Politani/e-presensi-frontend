// src/types/departments.ts

export interface Department {
  guid: string;
  name: string;
  code: string;
  headId?: string;
  memberIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  headId?: string;
  memberIds?: string[];
  isActive?: boolean;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  headId?: string;
  memberIds?: string[];
  isActive?: boolean;
}

export interface AssignHeadDto {
  userId: string;
}

export interface AddMembersDto {
  userIds: string[];
}
