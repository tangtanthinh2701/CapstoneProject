// ==================== PAYMENT ENUMS ====================

export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Chờ thanh tooán',
  [PaymentStatus.PROCESSING]: 'Đang xử lý',
  [PaymentStatus.COMPLETED]: 'Giao dịch hoàn thành',
  [PaymentStatus.FAILED]: 'Giao dịch thất bại',
  [PaymentStatus.REFUNDED]: 'Đã hoàtaiền',
  [PaymentStatus.CANCELLED]: 'Đã hủy',
};

export const PaymentMethod = {
  VNPAY: 'VNPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.VNPAY]: 'VNPay',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản',
  [PaymentMethod.CASH]: 'Tiền mặt',
};

export const OrderType = {
  CONTRACT_PAYMENT: 'CONTRACT_PAYMENT',
  CREDIT_PURCHASE: 'CREDIT_PURCHASE',
  RENEWAL_PAYMENT: 'RENEWAL_PAYMENT',
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const OrderTypeLabels: Record<OrderType, string> = {
  [OrderType.CONTRACT_PAYMENT]: 'Thanh toán hợp đồng',
  [OrderType.CREDIT_PURCHASE]: 'Mua tín chỉ carbon',
  [OrderType.RENEWAL_PAYMENT]: 'Thanh toán gia hạn',
};

// ==================== PAYMENT INTERFACES ====================

export interface Payment {
  id: number;
  paymentCode: string;
  userId: string;
  userName?: string;
  orderType: OrderType;
  referenceId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  bankCode?: string;
  orderInfo?: string;
  paymentUrl?: string;
  paidAt?: string;
  refundedAt?: string;
  refundReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VNPayCreateRequest {
  amount: number;
  orderInfo: string;
  orderType: OrderType;
  referenceId: number;
  returnUrl: string;
}

export interface VNPayCreateResponse {
  paymentId: number;
  paymentUrl: string;
  transactionRef: string;
}

export interface VNPayQueryResponse {
  transactionId: string;
  amount: number;
  orderInfo: string;
  responseCode: string;
  responseMessage: string;
  bankCode?: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
}

// ==================== PAYMENT SUMMARY ====================

export interface PaymentSummary {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  totalAmount: number;
  completedAmount: number;
}
