// ==================== OWNERSHIP ENUMS ====================

export const OwnershipStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  TRANSFERRED: 'TRANSFERRED',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type OwnershipStatus = (typeof OwnershipStatus)[keyof typeof OwnershipStatus];

export const OwnershipStatusLabels: Record<OwnershipStatus, string> = {
  [OwnershipStatus.ACTIVE]: 'Đang hoạt động',
  [OwnershipStatus.PENDING]: 'Chờ xử lý',
  [OwnershipStatus.TRANSFERRED]: 'Đã chuyển nhượng',
  [OwnershipStatus.EXPIRED]: 'Hết hạn',
  [OwnershipStatus.SUSPENDED]: 'Tạm ngưng',
};

export const OwnershipType = {
  FULL: 'FULL',
  PARTIAL: 'PARTIAL',
  SHARED: 'SHARED',
} as const;

export type OwnershipType = (typeof OwnershipType)[keyof typeof OwnershipType];

export const OwnershipTypeLabels: Record<OwnershipType, string> = {
  [OwnershipType.FULL]: 'Toàn bộ',
  [OwnershipType.PARTIAL]: 'Một phần',
  [OwnershipType.SHARED]: 'Chia sẻ',
};

export const TransferStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus];

export const TransferStatusLabels: Record<TransferStatus, string> = {
  [TransferStatus.PENDING]: 'Chờ xử lý',
  [TransferStatus.APPROVED]: 'Đã phê duyệt',
  [TransferStatus.REJECTED]: 'Từ chối',
  [TransferStatus.COMPLETED]: 'Hoàn thành',
  [TransferStatus.CANCELLED]: 'Đã hủy',
};

// ==================== OWNERSHIP INTERFACES ====================

export interface Ownership {
  id: number;
  ownershipCode?: string;
  contractId: number;
  contractCode?: string;
  userId: string;
  userName?: string;
  ownerName?: string;
  userEmail?: string;
  projectId: number;
  projectName?: string;
  ownershipPercentage: number;
  ownershipType?: OwnershipType;
  allocatedCredits: number;
  usedCredits: number;
  availableCredits: number;
  revenueShare?: number;
  status?: OwnershipStatus;
  ownershipStatus: OwnershipStatus;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnershipSummary {
  totalOwners: number;
  totalAllocatedCredits: number;
  totalUsedCredits: number;
  totalAvailableCredits: number;
  ownershipByProject: OwnershipByProject[];
}

export interface OwnershipByProject {
  projectId: number;
  projectName: string;
  totalOwners: number;
  totalPercentage: number;
  allocatedCredits: number;
}

// ==================== CREDIT ALLOCATION ====================

export interface CreditAllocation {
  id: number;
  carbonCreditId: number;
  creditCode?: string;
  contractId: number;
  contractCode?: string;
  ownerId: string;
  ownerName?: string;
  allocatedCredits: number;
  allocationPercentage: number;
  usedCredits: number;
  availableCredits: number;
  allocationDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreditAllocationRequest {
  carbonCreditId: number;
  contractId: number;
  ownerId: string;
  allocatedCredits: number;
  allocationPercentage: number;
  notes?: string;
}

// ==================== OWNERSHIP TRANSFER ====================

export interface OwnershipTransfer {
  id: number;
  fromOwnerId: string;
  fromOwnerName?: string;
  toOwnerId: string;
  toOwnerName?: string;
  contractId: number;
  contractCode?: string;
  transferPercentage: number;
  transferCredits: number;
  transferPrice: number;
  transferDate?: string;
  status?: TransferStatus;
  transferStatus: TransferStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface OwnershipTransferRequest {
  fromOwnerId: string;
  fromOwnershipId?: number;
  toOwnerId: string;
  contractId: number;
  transferPercentage: number;
  transferCredits: number;
  transferPrice: number;
  reason?: string;
  notes?: string;
}
