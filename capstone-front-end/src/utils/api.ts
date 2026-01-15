// ========== API CLIENT CONFIGURATION ==========

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, unknown>;
  timestamp: string;
  pageInfo?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class ApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(
    message: string,
    status?: number,
    errors?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// ========== AUTH HELPERS ==========

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Không tìm thấy token.  Vui lòng đăng nhập lại.', 401);
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ========== HTTP METHODS ==========

export const apiClient = {
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse<T>(response);
  },

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  async put<T>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse<T>(response);
  },
};

// ========== RESPONSE HANDLER ==========

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let data: Record<string, unknown>;

  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      (typeof data.message === 'string' ? data.message : null) ||
        `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      typeof data.errors === 'object' && data.errors !== null
        ? (data.errors as Record<string, unknown>)
        : undefined,
    );
  }

  if (!data.success) {
    throw new ApiError(
      (typeof data.message === 'string' ? data.message : null) ||
        'Request failed',
      response.status,
      typeof data.errors === 'object' && data.errors !== null
        ? (data.errors as Record<string, unknown>)
        : undefined,
    );
  }

  return data as unknown as ApiResponse<T>;
}

// ========== QUERY STRING BUILDER ==========

export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};
