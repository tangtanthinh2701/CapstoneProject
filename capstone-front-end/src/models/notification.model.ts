// ==================== NOTIFICATION ENUMS ====================

export const NotificationType = {
  CONTRACT_PENDING: 'CONTRACT_PENDING',
  CONTRACT_APPROVED: 'CONTRACT_APPROVED',
  CONTRACT_REJECTED: 'CONTRACT_REJECTED',
  CONTRACT_TERMINATED: 'CONTRACT_TERMINATED',
  RENEWAL_PENDING: 'RENEWAL_PENDING',
  RENEWAL_APPROVED: 'RENEWAL_APPROVED',
  RENEWAL_REJECTED: 'RENEWAL_REJECTED',
  TRANSFER_PENDING: 'TRANSFER_PENDING',
  TRANSFER_APPROVED: 'TRANSFER_APPROVED',
  TRANSFER_REJECTED: 'TRANSFER_REJECTED',
  CREDIT_ALLOCATED: 'CREDIT_ALLOCATED',
  CREDIT_PURCHASED: 'CREDIT_PURCHASED',
  CREDIT_RETIRED: 'CREDIT_RETIRED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.CONTRACT_PENDING]: 'Hợp đồng chờ duyệt',
  [NotificationType.CONTRACT_APPROVED]: 'Hợp đồng đã duyệt',
  [NotificationType.CONTRACT_REJECTED]: 'Hợp đồng bị từ chối',
  [NotificationType.CONTRACT_TERMINATED]: 'Hợp đồng đã bị chấm dứt',
  [NotificationType.RENEWAL_PENDING]: 'Yêu cầu gia hạn chờ duyệt',
  [NotificationType.RENEWAL_APPROVED]: 'Yêu cầu gia hạn đã duyệt',
  [NotificationType.RENEWAL_REJECTED]: 'Yêu cầu gia hạn bị từ chối',
  [NotificationType.TRANSFER_PENDING]: 'Yêu cầu chuyển nhượng chờ duyệt',
  [NotificationType.TRANSFER_APPROVED]: 'Yêu cầu chuyển nhượng đã duyệt',
  [NotificationType.TRANSFER_REJECTED]: 'Yêu cầu chuyển nhượng bị từ chối',
  [NotificationType.CREDIT_ALLOCATED]: 'Tín chỉ được phân bổ',
  [NotificationType.CREDIT_PURCHASED]: 'Mua tín chỉ thành công',
  [NotificationType.CREDIT_RETIRED]: 'Tín chỉ đã hết hạn',
  [NotificationType.PAYMENT_COMPLETED]: 'Thanh toán hoàn tất',
  [NotificationType.PAYMENT_FAILED]: 'Thanh toán thất bại',
  [NotificationType.SYSTEM]: 'Thông báo hệ thống',
};

// ==================== NOTIFICATION INTERFACES ====================

export interface Notification {
  id: number;
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  referenceId?: number;
  referenceType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationCount {
  total: number;
  unread: number;
}

// ==================== WEBSOCKET MESSAGE ====================

export interface WebSocketMessage {
  type: NotificationType;
  contractId?: number;
  contractCode?: string;
  renewalId?: number;
  transferId?: number;
  creditId?: number;
  message: string;
  timestamp: string;
}
