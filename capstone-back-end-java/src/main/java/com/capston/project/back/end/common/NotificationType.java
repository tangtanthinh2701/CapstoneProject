package com.capston.project.back.end.common;

public enum NotificationType {
    // Contract related
    CONTRACT_SUBMITTED,
    CONTRACT_APPROVED,
    CONTRACT_REJECTED,
    CONTRACT_EXPIRING_SOON,
    CONTRACT_EXPIRED,

    // Renewal related
    RENEWAL_REQUESTED,
    RENEWAL_APPROVED,
    RENEWAL_REJECTED,

    // Transfer related
    TRANSFER_REQUESTED,
    TRANSFER_APPROVED,
    TRANSFER_REJECTED,

    // Payment related
    PAYMENT_PENDING,
    PAYMENT_RECEIVED,
    PAYMENT_FAILED,
    PAYMENT_REFUNDED,

    // Credit related
    CREDIT_ALLOCATED,
    CREDIT_PURCHASED,
    CREDIT_RETIRED,
    CREDIT_VERIFIED,

    // Approval related (for WebSocket real-time)
    APPROVAL_REQUIRED,
    APPROVAL_SUCCESS,
    APPROVAL_REJECTED,

    // Health Alert (for AI Scheduler)
    HEALTH_ALERT,

    // System
    SYSTEM,
    ANNOUNCEMENT
}
