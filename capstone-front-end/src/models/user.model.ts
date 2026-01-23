// ==================== USER ENUMS ====================

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.USER]: 'Người dùng',
};

// ==================== USER INTERFACES ====================

export interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
  createdAt: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  address?: string;
}

// Alias for API compatibility
export type UserRequest = UserCreateRequest;

export interface UserUpdateRequest {
  fullname?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== AUTH INTERFACES ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  fullname: string;
  role: UserRole;
  expiresAt: string;
}

// ==================== USER ACTIVITY ====================

export interface UserActivity {
  id: number;
  userId: string;
  activityType: string;
  description: string;
  referenceId?: number;
  referenceType?: string;
  createdAt: string;
}
