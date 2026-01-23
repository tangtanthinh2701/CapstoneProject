import api from '../utils/api';

export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  address?: string;
  sex?: boolean;
  dateOfBirth?: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}

export const userApi = {
  getProfile: () => api.get<User>('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  changePassword: (data: any) => api.post('/user/change-password', data),

  // Admin only
  getAll: (params?: any) => api.get('/admin/users', { params }),
  create: (data: any, role: 'ADMIN' | 'USER') => api.post('/admin/users', data, { params: { role } }),
  updateRole: (userId: string, role: string) => api.put(`/admin/users/${userId}/role`, null, { params: { role } }),
  updateStatus: (userId: string, isActive: boolean) => api.put(`/admin/users/${userId}/status`, null, { params: { isActive } }),
};
