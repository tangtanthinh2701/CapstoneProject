// ==================== CARBON CREDIT ENUMS ====================

export const CreditStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  ISSUED: 'ISSUED',
  SOLD: 'SOLD',
  RETIRED: 'RETIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type CreditStatus = (typeof CreditStatus)[keyof typeof CreditStatus];

export const CreditStatusLabels: Record<CreditStatus, string> = {
  [CreditStatus.PENDING]: 'Cho xac minh',
  [CreditStatus.VERIFIED]: 'Da xac minh',
  [CreditStatus.ISSUED]: 'Da phat hanh',
  [CreditStatus.SOLD]: 'Da ban',
  [CreditStatus.RETIRED]: 'Da su dung',
  [CreditStatus.CANCELLED]: 'Da huy',
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
  ISSUANCE: 'ISSUANCE',
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  TRANSFER: 'TRANSFER',
  RETIRE: 'RETIRE',
  ALLOCATION: 'ALLOCATION',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.ISSUANCE]: 'Phát hành',
  [TransactionType.PURCHASE]: 'Mua',
  [TransactionType.SALE]: 'Bán',
  [TransactionType.TRANSFER]: 'Chuyển nhượng',
  [TransactionType.RETIRE]: 'Loại bỏ',
  [TransactionType.ALLOCATION]: 'Phân bổ',
};

// ==================== CARBON CREDIT INTERFACES ====================

export interface CarbonCredit {
  id: number;
  creditCode: string;
  projectId: number;
  projectName?: string;
  projectCode?: string;
  issuanceYear: number;
  issuanceDate: string;
  expirationDate?: string;
  totalCo2Tons: number;
  creditsIssued: number;
  creditsSold: number;
  creditsRetired: number;
  creditsAvailable: number;
  basePricePerCredit: number;
  currentPricePerCredit: number;
  verificationStandard: VerificationStandard;
  verificationDate?: string;
  verifiedBy?: string;
  certificateUrl?: string;
  creditStatus: CreditStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarbonCreditRequest {
  projectId: number;
  issuanceYear: number;
  totalCo2Tons: number;
  creditsIssued: number;
  basePricePerCredit: number;
  currentPricePerCredit?: number;
  verificationStandard: VerificationStandard;
  notes?: string;
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
  totalCreditsIssued: number;
  totalCreditsSold: number;
  totalCreditsRetired: number;
  totalCreditsAvailable: number;
  totalRevenue: number;
  averagePricePerCredit: number;
  creditsByProject: CreditsByProject[];
  creditsByYear: CreditsByYear[];
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
