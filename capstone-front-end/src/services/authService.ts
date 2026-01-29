import type { LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, unknown>;
  timestamp: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Đăng nhập thất bại');
    }

    // Save token and user info to localStorage
    if (result.data?.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('userId', result.data.userId);
      localStorage.setItem('username', result.data.username);
      localStorage.setItem('role', result.data.role);
    }

    return result;
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Đăng ký thất bại');
    }

    return result;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUserId(): string | null {
    return localStorage.getItem('userId');
  },

  getUsername(): string | null {
    return localStorage.getItem('username');
  },

  getRole(): string | null {
    return localStorage.getItem('role');
  },

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'ADMIN';
  },

  isUser(): boolean {
    return localStorage.getItem('role') === 'USER';
  },
};
