export interface Farm {
  id: number;
  code: string;
  name: string;
  description?: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  usableArea: number;
  totalTrees: number;
  aliveTrees: number;
  deadTrees: number;
  availableTreesForSale?: number;
  soilType: string;
  climateZone: string;
  avgRainfall: number;
  avgTemperature: number;
  farmStatus: string;
  plantingDate: string;
  totalEstimatedCarbon?: number;
  totalAbsorbedCarbon?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  treesFarms?: FarmTree[];
  totalSpecies?: number;
}

export interface FarmPayload {
  name: string;
  description?: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  usableArea: number;
  soilType: string;
  climateZone: string;
  avgRainfall: number;
  avgTemperature: number;
  farmStatus: string;
  plantingDate: string;
  createdBy?: string;
}

export interface FarmTree {
  id: number;
  farmId: number;
  farmName: string;
  treeSpeciesId: number;
  treeSpeciesName: string;
  scientificName: string;
  carbonAbsorptionRate: number;
  numberTrees: number;
  availableTrees: number;
  soldTrees: number;
  latitude: number;
  longitude: number;
  plantingDate: string;
  ageInYears: number;
  ageInMonths: number;
  currentAvgHeight: number;
  currentAvgTrunkDiameter: number;
  currentAvgCanopyDiameter: number;
  currentAvgHealthStatus: string;
  estimatedCarbonPerTree: number;
  totalEstimatedCarbon: number;
  totalCo2Absorbed: number;
  treeStatus: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddTreeToFarmPayload {
  farmId: number;
  treeSpeciesId: number;
  numberTrees: number;
  latitude: number;
  longitude: number;
  plantingDate: string;
  currentAvgHeight: number;
  currentAvgTrunkDiameter: number;
  currentAvgCanopyDiameter: number;
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

// ========== HELPERS ==========
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

const API_BASE = 'http://localhost:8088/api/farms';

// ========== FARM CRUD ==========

/** GET ALL FARMS */
export const getFarmList = async (
  page: number = 0,
  size: number = 100,
): Promise<ApiResponse<Farm[]>> => {
  const res = await fetch(`${API_BASE}?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Không tải được danh sách nông trại');
  }

  const json: ApiResponse<Farm[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không tải được danh sách nông trại');
  }

  return json;
};

/** GET BY ID */
export const getFarmById = async (id: number): Promise<ApiResponse<Farm>> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Không tìm thấy nông trại');
    }
    const error = await res.json();
    throw new Error(error.message || 'Tải dữ liệu thất bại');
  }

  const json: ApiResponse<Farm> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Tải dữ liệu thất bại');
  }

  return json;
};

/** CREATE */
export const createFarm = async (payload: FarmPayload) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Tạo nông trại thất bại');
  }

  const json: ApiResponse<Farm> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Tạo nông trại thất bại');
  }

  return json;
};

/** UPDATE */
export const updateFarm = async (id: number, payload: FarmPayload) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Cập nhật nông trại thất bại');
  }

  const json: ApiResponse<Farm> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Cập nhật nông trại thất bại');
  }

  return json;
};

/** DELETE */
export const deleteFarm = async (id: number) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Xóa nông trại thất bại');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Xóa nông trại thất bại');
  }

  return json;
};

// ========== FARM TREES ==========

/** ADD TREE TO FARM */
export const addTreeToFarm = async (payload: AddTreeToFarmPayload) => {
  const res = await fetch(`${API_BASE}/trees`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Thêm cây vào nông trại thất bại');
  }

  const json: ApiResponse<FarmTree> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Thêm cây vào nông trại thất bại');
  }

  return json;
};

/** GET TREES IN FARM */
export const getFarmTrees = async (farmId: number): Promise<FarmTree[]> => {
  const res = await fetch(`${API_BASE}/${farmId}/trees`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Không tải được danh sách cây trong nông trại');
  }

  const json: ApiResponse<FarmTree[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không tải được danh sách cây');
  }

  return json.data;
};
