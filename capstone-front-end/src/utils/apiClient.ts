// API Client Utility - Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
  pageInfo?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get auth headers with token (optional for public endpoints)
export const getAuthHeaders = (requireAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');

  if (requireAuth && !token) {
    throw new ApiError('Token không tồn tại. Vui lòng đăng nhập lại.', 401);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const role = localStorage.getItem('role');
  return role === 'ADMIN';
};

// Get current user ID
export const getCurrentUserId = (): string => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    throw new ApiError('User ID khong ton tai.', 401);
  }
  return userId;
};

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { requireAuth?: boolean } = {},
): Promise<ApiResponse<T>> {
  try {
    const { requireAuth = true, ...fetchOptions } = options;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...getAuthHeaders(requireAuth),
        ...fetchOptions.headers,
      },
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      throw new ApiError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 401);
    }

    // Parse response
    const data: ApiResponse<T> = await response.json();

    // Handle unsuccessful response
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data.errors,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi gọi API');
  }
}

// Convenience methods
export const apiGet = <T>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' });

export const apiPost = <T>(endpoint: string, body?: any) =>
  apiCall<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = <T>(endpoint: string, body?: any) =>
  apiCall<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = <T>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' });

// Format helpers
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};
