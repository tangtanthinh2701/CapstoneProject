// ==================== CONTRACT ENUMS ====================

export const ContractStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
  RENEWED: 'RENEWED',
} as const;

export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Bản nháp',
  [ContractStatus.PENDING]: 'Chờ xử lý',
  [ContractStatus.ACTIVE]: 'Hoạt động',
  [ContractStatus.EXPIRED]: 'Hết hạn',
  [ContractStatus.TERMINATED]: 'Đã chấm dứt',
  [ContractStatus.RENEWED]: 'Đã gia hạn',
};

export const ContractType = {
  OWNERSHIP: 'OWNERSHIP',
  PARTNERSHIP: 'PARTNERSHIP',
  INVESTMENT: 'INVESTMENT',
  SERVICE: 'SERVICE',
} as const;

export type ContractType = (typeof ContractType)[keyof typeof ContractType];

export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.OWNERSHIP]: 'Sở hữu',
  [ContractType.PARTNERSHIP]: 'Đối tác',
  [ContractType.INVESTMENT]: 'Đầu tư',
  [ContractType.SERVICE]: 'Dịch vụ',
};

// ==================== CONTRACT INTERFACES ====================

export interface Contract {
  id: number;
  contractCode: string;
  projectId: number;
  projectName?: string;
  contractType: ContractType;
  partyAId: string;
  partyAName?: string;
  partyBId?: string;
  partyBName?: string;
  contractStatus: ContractStatus;
  totalAmount: number;
  paymentTerms?: string;
  startDate: string;
  endDate: string;
  contractTermYears: number;
  autoRenewal: boolean;
  maxRenewals: number;
  currentRenewalCount: number;
  harvestRights: boolean;
  transferAllowed: boolean;
  carbonCreditPercentage: number;
  termsAndConditions?: string;
  notes?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  terminatedBy?: string;
  terminatedAt?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractCreateRequest {
  projectId: number;
  contractType: ContractType;
  partyAId?: string;
  totalAmount: number;
  totalValue?: number;
  startDate: string;
  endDate: string;
  contractTermYears: number;
  durationYears?: number;
  autoRenewal?: boolean;
  isRenewable?: boolean;
  maxRenewals?: number;
  harvestRights?: boolean;
  transferAllowed?: boolean;
  carbonCreditPercentage?: number;
  paymentTerms?: string;
  termsAndConditions?: string;
  notes?: string;
}

// Alias for backward compatibility
export type ContractRequest = ContractCreateRequest;

export interface ContractUpdateRequest {
  totalAmount?: number;
  endDate?: string;
  autoRenewal?: boolean;
  harvestRights?: boolean;
  transferAllowed?: boolean;
  paymentTerms?: string;
  termsAndConditions?: string;
  notes?: string;
}

export interface ContractApproval {
  approvedBy: string;
  notes?: string;
}

export interface ContractTermination {
  terminationReason: string;
}

// ==================== CONTRACT RENEWAL ====================

export const RenewalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type RenewalStatus = (typeof RenewalStatus)[keyof typeof RenewalStatus];

export const RenewalStatusLabels: Record<RenewalStatus, string> = {
  [RenewalStatus.PENDING]: 'Cho duyệt',
  [RenewalStatus.APPROVED]: 'Đã duyệt',
  [RenewalStatus.REJECTED]: 'Từ chối',
};

export interface ContractRenewal {
  id: number;
  contractId: number;
  contractCode?: string;
  renewalTermYears: number;
  renewalAmount: number;
  requestedBy: string;
  requestedByName?: string;
  renewalStatus: RenewalStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface ContractRenewalRequest {
  contractId: number;
  renewalTermYears: number;
  renewalAmount: number;
  requestedBy?: string;
  notes?: string;
}

// ==================== CONTRACT TRANSFER ====================

export const TransferStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus];

export const TransferStatusLabels: Record<TransferStatus, string> = {
  [TransferStatus.PENDING]: 'Chờ xử lý',
  [TransferStatus.APPROVED]: 'Đã duyệt',
  [TransferStatus.REJECTED]: 'Từ chối',
  [TransferStatus.CANCELLED]: 'Đã hủy',
};

export interface ContractTransfer {
  id: number;
  contractId: number;
  contractCode?: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  transferPercentage: number;
  transferAmount: number;
  transferStatus: TransferStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface ContractTransferRequest {
  contractId: number;
  toUserId: string;
  transferPercentage: number;
  transferAmount: number;
  notes?: string;
}

// ==================== CONTRACT SUMMARY ====================

export interface ContractSummary {
  totalContracts: number;
  activeContracts: number;
  pendingContracts: number;
  expiredContracts: number;
  terminatedContracts: number;
  totalValue: number;
  averageValue: number;
}
