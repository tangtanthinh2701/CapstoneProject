import { apiClient, type ApiResponse } from '../utils/api';
import type {
  User,
  UserProfile,
  UserUpdateRequest,
  UserCreateRequest,
  ChangePasswordRequest,
  UserActivity,
} from '../models/user.model';

export const userService = {
  // ==================== USER PROFILE (DÃ nh cho USER) ====================

  async getMyProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/user/profile');
  },

  async updateMyProfile(data: UserUpdateRequest): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/user/profile', data as unknown as Record<string, unknown>);
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      '/user/change-password',
      data as unknown as Record<string, unknown>,
    );
  },

  async getMyContracts(page = 0, size = 10): Promise<ApiResponse<unknown[]>> {
    return apiClient.get<unknown[]>('/user/contracts', { page, size });
  },

  async getMyAllocations(page = 0, size = 10): Promise<ApiResponse<unknown[]>> {
    return apiClient.get<unknown[]>('/user/allocations', { page, size });
  },

  async getMyTransactions(page = 0, size = 10): Promise<ApiResponse<unknown[]>> {
    return apiClient.get<unknown[]>('/user/transactions', { page, size });
  },

  async getMyActivities(page = 0, size = 10): Promise<ApiResponse<UserActivity[]>> {
    return apiClient.get<UserActivity[]>('/user/activities', { page, size });
  },

  // ==================== ADMIN USER MANAGEMENT ====================

  async getAllUsers(
    page = 0,
    size = 10,
    role?: string,
    isActive?: boolean,
  ): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>('/admin/users', {
      page,
      size,
      role,
      isActive,
    });
  },

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/admin/users/${userId}`);
  },

  async createUser(data: UserCreateRequest, role = 'USER'): Promise<ApiResponse<User>> {
    return apiClient.post<User>(
      `/admin/users?role=${role}`,
      data as unknown as Record<string, unknown>,
    );
  },

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/admin/users/${userId}/role?role=${role}`);
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/admin/users/${userId}/status?isActive=${isActive}`);
  },

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/users/${userId}`);
  },

  async getPendingApprovals(): Promise<ApiResponse<unknown>> {
    return apiClient.get<unknown>('/admin/pending-approvals');
  },
};
