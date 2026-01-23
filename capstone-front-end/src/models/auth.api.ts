import api from '../utils/api';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    fullname: string;
    role: string;
  };
}

export const authApi = {
  login: (data: any) => api.post<AuthResponse>('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (data: any) => api.post('/auth/verify-otp', data),
  logout: () => api.post('/auth/logout'),
};
