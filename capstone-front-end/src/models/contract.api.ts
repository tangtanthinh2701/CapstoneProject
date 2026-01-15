// ==================== TYPES ====================
export interface Contract {
  id: number;
  contractCode: string;
  projectId: number;
  projectName: string;
  projectCode: string;
  contractCategory: 'ENTERPRISE_PROJECT' | 'INDIVIDUAL_TREE';
  contractType: 'OWNERSHIP' | 'SERVICE';
  unitPrice: number;
  totalAmount: number;
  contractTermYears: number;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  renewalTermYears: number | null;
  renewalNoticeDays: number | null;
  maxRenewals: number | null;
  renewalCount: number;
  canRenew: boolean;
  content: {
    treeCount?: number;
    carbonPercentage?: number;
    benefits?: string[];
    serviceScope?: string;
    kpiRequirements?: string[];
  } | null;
  harvestRights: boolean;
  transferAllowed: boolean;
  earlyTerminationPenalty: number | null;
  terminationReason: string | null;
  terminatedAt: string | null;
  contractStatus: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  isExpiringSoon: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  paymentDate: string | null;
  contractFileUrl: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;
  serviceScope: string | null;
  kpiRequirements: string | null;
  createdAt: string;
  updatedAt: string;
  renewals: Renewal[] | null;
  totalOwnerships: number | null;
}

export interface Renewal {
  id: number;
  originalContractId: number;
  originalContractCode: string;
  newContractId: number | null;
  newContractCode: string | null;
  renewalNumber: number;
  renewalTermYears: number;
  oldEndDate: string;
  newStartDate: string;
  newEndDate: string;
  renewalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  requestedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ContractPayload {
  projectId: number;
  contractCategory: 'ENTERPRISE_PROJECT' | 'INDIVIDUAL_TREE';
  contractType: 'OWNERSHIP' | 'SERVICE';
  unitPrice: number;
  totalAmount: number;
  contractTermYears: number;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  renewalTermYears?: number;
  renewalNoticeDays?: number;
  maxRenewals?: number;
  harvestRights: boolean;
  transferAllowed: boolean;
  earlyTerminationPenalty?: number;
  notes?: string;
  content?: {
    treeCount?: number;
    carbonPercentage?: number;
    benefits?: string[];
    serviceScope?: string;
    kpiRequirements?: string[];
  };
}

export interface ApprovePayload {
  approvedBy: string;
  notes?: string;
}

export interface RenewalPayload {
  contractId: number;
  renewalTermYears: number;
  renewalAmount: number;
  notes?: string;
  requestedBy: string;
}

export interface TerminatePayload {
  terminationReason: string;
  terminatedBy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
  pageInfo: PageInfo | null;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ContractStats {
  total: number;
  active: number;
  pending: number;
  expiringSoon: number;
}

// ==================== CONFIG ====================
const API_BASE = 'http://localhost:8088/api/contracts';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ==================== API CALLS ====================

/**
 * Get contract list with optional filters
 */
export const getContractList = async (params?: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  month?: number;
  year?: number;
}): Promise<ApiResponse<Contract[]>> => {
  const queryParams = new URLSearchParams();

  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.size !== undefined)
    queryParams.append('size', params.size.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.month) queryParams.append('month', params.month.toString());
  if (params?.year) queryParams.append('year', params.year.toString());

  const url = `${API_BASE}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Get contract by ID
 */
export const getContractById = async (
  id: number,
): Promise<ApiResponse<Contract>> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Create new contract
 */
export const createContract = async (
  payload: ContractPayload,
): Promise<ApiResponse<Contract>> => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Update contract
 */
export const updateContract = async (
  id: number,
  payload: ContractPayload,
): Promise<ApiResponse<Contract>> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Delete contract
 */
export const deleteContract = async (
  id: number,
): Promise<ApiResponse<void>> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Submit contract for approval
 */
export const submitContract = async (
  id: number,
): Promise<ApiResponse<Contract>> => {
  const res = await fetch(`${API_BASE}/${id}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Approve contract
 */
export const approveContract = async (
  id: number,
  payload: ApprovePayload,
): Promise<ApiResponse<Contract>> => {
  const res = await fetch(`${API_BASE}/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Request contract renewal
 */
export const requestRenewal = async (
  payload: RenewalPayload,
): Promise<ApiResponse<Renewal>> => {
  const res = await fetch(`${API_BASE}/renewals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Terminate contract
 */
export const terminateContract = async (
  id: number,
  payload: TerminatePayload,
): Promise<ApiResponse<Contract>> => {
  const res = await fetch(`${API_BASE}/${id}/terminate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Get contract statistics
 */
export const getContractStats = async (): Promise<ContractStats> => {
  const response = await getContractList({ size: 1000 }); // Get all for stats

  if (!response.success || !response.data) {
    return { total: 0, active: 0, pending: 0, expiringSoon: 0 };
  }

  const contracts = response.data;

  return {
    total: contracts.length,
    active: contracts.filter((c) => c.contractStatus === 'ACTIVE').length,
    pending: contracts.filter((c) => c.contractStatus === 'PENDING').length,
    expiringSoon: contracts.filter((c) => c.isExpiringSoon).length,
  };
};
