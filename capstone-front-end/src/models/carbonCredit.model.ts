// ==================== CARBON CREDIT ENUMS ====================

export const CreditStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  ISSUED: 'ISSUED',
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
  SOLD_OUT: 'SOLD_OUT',
  RETIRED: 'RETIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type CreditStatus = (typeof CreditStatus)[keyof typeof CreditStatus];

export const CreditStatusLabels: Record<CreditStatus, string> = {
  [CreditStatus.PENDING]: 'Chờ xác minh',
  [CreditStatus.VERIFIED]: 'Đã xác minh',
  [CreditStatus.ISSUED]: 'Đã phát hành',
  [CreditStatus.AVAILABLE]: 'Có sẵn',
  [CreditStatus.SOLD]: 'Đã bán',
  [CreditStatus.SOLD_OUT]: 'Hết hàng',
  [CreditStatus.RETIRED]: 'Đã sử dụng',
  [CreditStatus.CANCELLED]: 'Đã hủy',
};

export const VerificationStandard = {
  VCS: 'VCS',
  GOLD_STANDARD: 'GOLD_STANDARD',
  CDM: 'CDM',
  PLAN_VIVO: 'PLAN_VIVO',
  OTHER: 'OTHER',
} as const;

export type VerificationStandard = (typeof VerificationStandard)[keyof typeof VerificationStandard];

export const VerificationStandardLabels: Record<VerificationStandard, string> = {
  [VerificationStandard.VCS]: 'Verified Carbon Standard (VCS)',
  [VerificationStandard.GOLD_STANDARD]: 'Gold Standard',
  [VerificationStandard.CDM]: 'Clean Development Mechanism (CDM)',
  [VerificationStandard.PLAN_VIVO]: 'Plan Vivo',
  [VerificationStandard.OTHER]: 'Khac',
};

export const TransactionType = {
  PURCHASE: 'PURCHASE',
  RETIRE: 'RETIRE',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.PURCHASE]: 'Mua',
  [TransactionType.RETIRE]: 'Loại bỏ',
};

export interface CreditOrigin {
  farmId: number;
  farmName?: string;
  batchId: number;
  batchCode?: string;
  quantity: number;
}

export interface CarbonCredit {
  id: number;
  creditCode: string;
  projectId: number;
  projectName?: string;
  projectCode?: string;
  origins: CreditOrigin[];
  issuanceYear: number;
  issuanceDate?: string;
  expirationDate?: string;
  totalCo2Tons: number;
  creditsIssued: number;
  creditsSold: number;
  creditsRetired: number;
  creditsAvailable: number;
  pricePerCredit?: number;
  basePricePerCredit?: number;
  currentPricePerCredit?: number;
  creditsStatus?: CreditStatus;
  hasAvailableCredits?: boolean;
  isExpired?: boolean;
  verificationStandard: VerificationStandard;
  certificateUrl?: string;
  issuedBy?: string;
  issuedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  allocations: any[];
  totalTransactions?: number;
  totalRevenue?: number;
}

export interface CarbonCreditRequest {
  projectId: number;
  issuanceYear: number;
  totalCo2Tons: number;
  creditsIssued: number;
  basePricePerCredit: number;
  currentPricePerCredit: number;
  verificationStandard: string;
  origins: { farmId: number; batchId: number; quantity: number }[];
}

export interface CreditVerification {
  verifiedBy: string;
  verificationDate: string;
  certificateUrl?: string;
  notes?: string;
}

// ==================== CREDIT TRANSACTION ====================

export interface CreditTransaction {
  id: number;
  transactionCode: string;
  carbonCreditId: number;
  creditCode?: string;
  transactionType: TransactionType;
  fromUserId?: string;
  fromUserName?: string;
  toUserId?: string;
  toUserName?: string;
  quantity: number;
  pricePerCredit: number;
  totalAmount: number;
  transactionDate: string;
  paymentId?: number;
  paymentStatus?: string;
  retirementReason?: string;
  retirementCertificateUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface CreditPurchaseRequest {
  creditId: number;
  quantity: number;
  notes?: string;
}

export interface CreditRetireRequest {
  creditId: number;
  quantity: number;
  retirementReason: string;
  notes?: string;
}

export interface CreditAllocationRequest {
  contractId: number;
  ownerId: string;
  allocatedCredits: number;
  allocationPercentage: number;
  notes?: string;
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
  usedCredits: number;
  availableCredits: number;
  allocationPercentage: number;
  allocationDate: string;
  claimedAt?: string;
  notes?: string;
  createdAt: string;
}

// ==================== CREDIT SUMMARY ====================

export interface CreditSummary {
  totalCreditRecords: number | null;
  availableCreditRecords: number | null;
  soldOutCreditRecords: number | null;
  totalCreditsIssued: number;
  totalCreditsSold: number;
  totalCreditsRetired: number;
  totalCreditsAvailable: number;
  totalCo2Tons: number | null;
  totalRevenue: number;
  averagePricePerCredit: number | null;
  totalTransactions: number | null;
  purchasedTransactions: number | null;
  retiredTransactions: number | null;
}

export interface CreditsByProject {
  projectId: number;
  projectName: string;
  creditsIssued: number;
  creditsSold: number;
  creditsAvailable: number;
  revenue: number;
}

export interface CreditsByYear {
  year: number;
  creditsIssued: number;
  creditsSold: number;
  creditsRetired: number;
  averagePrice: number;
}

// ==================== RETIREMENT CERTIFICATE ====================

export interface RetirementCertificate {
  id: number;
  transactionId: number;
  transactionCode: string;
  userId: string;
  userName: string;
  projectName: string;
  quantity: number;
  co2Tons: number;
  retirementDate: string;
  retirementReason: string;
  certificateNumber: string;
  certificateUrl: string;
  createdAt: string;
}
