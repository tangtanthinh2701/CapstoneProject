export interface TreeSpecies {
  id: number;
  name: string;
  scientificName: string;
  carbonAbsorptionRate: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  estimatedCarbonPerYear: number;
  estimatedCarbon5Years: number;
  estimatedCarbon10Years: number;
}

export interface TreeSpeciesPayload {
  name: string;
  scientificName: string;
  carbonAbsorptionRate: number;
  description?: string;
  imageUrl?: string;
}

interface ApiResponse<T> {
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
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token không tồn tại.  Vui lòng đăng nhập lại.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};
/** CREATE */
export const createTreeSpecies = async (payload: TreeSpeciesPayload) => {
  const res = await fetch('http://localhost:8088/api/tree-species', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Tạo loài cây thất bại');
  }

  const json: ApiResponse<TreeSpecies> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Tạo loài cây thất bại');
  }

  return json;
};

/** UPDATE */
export const updateTreeSpecies = async (
  id: number,
  payload: TreeSpeciesPayload,
) => {
  const res = await fetch(`http://localhost:8088/api/tree-species/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Cập nhật loài cây thất bại');
  }

  const json: ApiResponse<TreeSpecies> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Cập nhật loài cây thất bại');
  }

  return json;
};

/** GET BY ID */
export const getTreeSpeciesById = async (id: number) => {
  const res = await fetch(`http://localhost:8088/api/tree-species/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Không tìm thấy loài cây');
    }
    const error = await res.json();
    throw new Error(error.message || 'Tải dữ liệu thất bại');
  }

  const json: ApiResponse<TreeSpecies> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Tải dữ liệu thất bại');
  }

  return json;
};

/** GET ALL (with pagination) */
export const getTreeSpeciesList = async (
  page: number = 0,
  size: number = 100,
): Promise<ApiResponse<TreeSpecies[]>> => {
  const res = await fetch(
    `http://localhost:8088/api/tree-species?page=${page}&size=${size}`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error('Không tải được danh sách loài cây');
  }

  const json: ApiResponse<TreeSpecies[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không tải được danh sách loài cây');
  }

  return json;
};

/** GET ALL - Simple version (for dropdowns, etc.) */
export const fetchTreeSpecies = async (): Promise<TreeSpecies[]> => {
  const response = await getTreeSpeciesList(0, 100);
  return response.data;
};

/** DELETE */
export const deleteTreeSpecies = async (id: number) => {
  const res = await fetch(`http://localhost:8088/api/tree-species/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Xóa loài cây thất bại');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Xóa loài cây thất bại');
  }

  return json;
};
