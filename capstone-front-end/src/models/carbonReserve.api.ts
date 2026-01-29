// ========== TYPES ==========
export interface ProjectCarbonReserve {
  projectId: number;
  projectName: string;
  projectCode: string;
  totalTargetCarbon: number;
  totalPurchasedCarbon: number;
  totalAllocatedFromReserve: number;
  totalAcquiredCarbon: number;
  totalActualAbsorbedCarbon: number;
  totalCarbonDeficit: number;
  totalCarbonSurplus: number;
  reserveAvailable: number;
  overallCompletionPercentage: number;
  phases: PhaseCarbonInfo[];
}

export interface PhaseCarbonInfo {
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
  status: 'DEFICIT' | 'BALANCED' | 'SURPLUS';
}

export interface CarbonReserveTransaction {
  id: number;
  projectId: number;
  sourcePhaseId?: number;
  sourcePhaseName?: string;
  targetPhaseId?: number;
  targetPhaseName?: string;
  transactionType:
    | 'TRANSFER_TO_RESERVE'
    | 'ALLOCATE_FROM_RESERVE'
    | 'PHASE_TO_PHASE';
  carbonAmount: number;
  notes?: string;
  allocatedBy: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
  timestamp: string;
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

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ========== API CALLS ==========

/** GET PROJECT CARBON RESERVE OVERVIEW */
export const getProjectCarbonReserve = async (
  projectId: number,
): Promise<ProjectCarbonReserve> => {
  const res = await fetch(`${API_BASE}/projects/${projectId}/carbon-reserve`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Không tải được thông tin quỹ carbon');
  }

  const json: ApiResponse<ProjectCarbonReserve> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không tải được thông tin quỹ carbon');
  }

  return json.data;
};

/** GET RESERVE TRANSACTIONS */
export const getReserveTransactions = async (
  projectId: number,
): Promise<CarbonReserveTransaction[]> => {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/carbon-reserve/transactions`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error('Không tải được lịch sử giao dịch');
  }

  const json: ApiResponse<CarbonReserveTransaction[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không tải được lịch sử giao dịch');
  }

  return json.data;
};
