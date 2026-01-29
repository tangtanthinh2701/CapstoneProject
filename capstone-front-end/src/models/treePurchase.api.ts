// ========== TYPES ==========
export interface TreePurchase {
  id: number;
  phaseId: number;
  phaseName: string;
  phaseOrder: number;
  projectId: number;
  projectName: string;
  farmId: number;
  farmName: string;
  treeSpeciesId: number;
  treeSpeciesName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  estimatedCarbonPerTree: number;
  totalEstimatedCarbon: number;
  actualCarbonAbsorbed: number;
  carbonDeficit: number;
  purchaseStatus: 'PENDING' | 'APPROVED' | 'DELIVERED' | 'CANCELLED';
  purchaseDate: string;
  deliveryDate?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreePurchasePayload {
  phaseId: number;
  farmId: number;
  treeSpeciesId: number;
  quantity: number;
  unitPrice: number;
  purchaseDate: string;
  notes?: string;
  createdBy?: string;
}

export interface CarbonSummary {
  phaseId: number;
  phaseName: string;
  phaseOrder: number;
  targetCarbon: number;
  purchasedCarbon: number;
  allocatedFromReserve: number;
  totalAcquiredCarbon: number;
  actualAbsorbedCarbon: number;
  carbonDeficit: number;
  carbonSurplus: number;
  completionPercentage: number;
  totalCost: number;
  budgetRemaining: number;
  purchases: TreePurchase[];
  reserveAvailable: number;
}

export interface CarbonAllocationPayload {
  sourcePhaseId: number;
  targetPhaseId: number;
  carbonAmount: number;
  notes?: string;
  allocatedBy?: string;
}

export interface AvailableTree {
  farmId: number;
  farmName: string;
  farmLocation?: string;
  treesFarmId?: number;
  treeSpeciesId: number;
  treeSpeciesName: string;
  scientificName: string;
  availableTrees: number;
  plantingDate?: string;
  ageInMonths?: number;
  ageInYears?: number;
  carbonAbsorptionRate?: number;
  estimatedCarbonPerTree: number;
  totalAvailableCarbon?: number;
  suggestedUnitPrice: number;
  environmentalFactor?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
  timestamp: string;
  pageInfo?: any;
}

import { API_BASE_URL } from '../utils/api';

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

const API_BASE = `${API_BASE_URL}/tree-purchases`;

// ========== API CALLS ==========

/** GET AVAILABLE TREES */
export const getAvailableTrees = async (): Promise<AvailableTree[]> => {
  const res = await fetch(`${API_BASE_URL}/farms/available-trees`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Không tải được danh sách cây khả dụng');
  }

  const json: ApiResponse<AvailableTree[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không tải được danh sách cây');
  }

  return json.data;
};

/** CREATE TREE PURCHASE */
export const createTreePurchase = async (payload: TreePurchasePayload) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Tạo đơn mua cây thất bại');
  }

  const json: ApiResponse<TreePurchase> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Tạo đơn mua cây thất bại');
  }

  return json;
};

/** APPROVE PURCHASE */
export const approvePurchase = async (
  purchaseId: number,
  approvedBy: string,
) => {
  const res = await fetch(
    `${API_BASE}/${purchaseId}/approve? approvedBy=${approvedBy}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Duyệt đơn thất bại');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Duyệt đơn thất bại');
  }

  return json;
};

/** DELIVER PURCHASE */
export const deliverPurchase = async (purchaseId: number) => {
  const res = await fetch(`${API_BASE}/${purchaseId}/deliver`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Giao hàng thất bại');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Giao hàng thất bại');
  }

  return json;
};

/** CANCEL PURCHASE */
export const cancelPurchase = async (purchaseId: number, reason: string) => {
  const res = await fetch(
    `${API_BASE}/${purchaseId}/cancel?reason=${encodeURIComponent(reason)}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Hủy đơn thất bại');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Hủy đơn thất bại');
  }

  return json;
};

/** GET CARBON SUMMARY FOR PHASE */
export const getCarbonSummary = async (
  phaseId: number,
): Promise<CarbonSummary> => {
  const res = await fetch(`${API_BASE}/phase/${phaseId}/carbon-summary`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Không tải được thống kê carbon');
  }

  const json: ApiResponse<CarbonSummary> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không tải được thống kê carbon');
  }

  return json.data;
};

/** ALLOCATE CARBON FROM RESERVE */
export const allocateCarbon = async (payload: CarbonAllocationPayload) => {
  const res = await fetch(`${API_BASE}/allocate-carbon`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Phân bổ carbon thất bại');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Phân bổ carbon thất bại');
  }

  return json;
};

/** TRANSFER SURPLUS TO RESERVE */
export const transferSurplusToReserve = async (
  phaseId: number,
  userId: string,
) => {
  const res = await fetch(
    `${API_BASE}/phase/${phaseId}/transfer-surplus?userId=${userId}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Chuyển carbon dư thất bại');
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Chuyển carbon dư thất bại');
  }

  return json;
};
