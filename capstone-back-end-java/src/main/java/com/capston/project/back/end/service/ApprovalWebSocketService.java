package com.capston.project.back.end.service;

import com.capston.project.back.end.common.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service để gửi real-time notifications qua WebSocket cho các tính năng phê duyệt
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi notification đến tất cả admins khi có yêu cầu phê duyệt mới
     */
    public void notifyAdminsNewApprovalRequest(String type, String title, String message,
                                                Integer referenceId, Map<String, Object> metadata) {
        log.info("Sending approval request notification to admins: {} - {}", type, title);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("notificationType", NotificationType.APPROVAL_REQUIRED);
        payload.put("title", title);
        payload.put("message", message);
        payload.put("referenceId", referenceId);
        payload.put("timestamp", OffsetDateTime.now());
        if (metadata != null) {
            payload.put("metadata", metadata);
        }

        // Broadcast to all admins listening on /topic/approvals
        messagingTemplate.convertAndSend("/topic/approvals", (Object) payload);
        log.info("Approval notification sent to /topic/approvals");
    }

    /**
     * Gửi notification đến user cụ thể khi yêu cầu của họ được phê duyệt
     */
    public void notifyUserApprovalResult(UUID userId, String type, String title,
                                          String message, Integer referenceId, boolean approved) {
        log.info("Sending approval result to user {}: {} - approved={}", userId, type, approved);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("notificationType", approved ? NotificationType.APPROVAL_SUCCESS : NotificationType.APPROVAL_REJECTED);
        payload.put("title", title);
        payload.put("message", message);
        payload.put("referenceId", referenceId);
        payload.put("approved", approved);
        payload.put("timestamp", OffsetDateTime.now());

        // Send to specific user
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                payload
        );
        log.info("Approval result sent to user: {}", userId);
    }

    // ==================== CONTRACT APPROVAL ====================

    /**
     * Thông báo* Sanitize user-provided text before including it in notifications.
     * This performs basic HTML-style escaping to prevent injection when rendered on the client.
     */
    private String sanitizeForNotification(String input) {
        if (input == null) {
            return null;
        }
        String sanitized = input;
        sanitized = sanitized.replace("&", "&amp;");
        sanitized = sanitized.replace("<", "&lt;");
        sanitized = sanitized.replace(">", "&gt;");
        sanitized = sanitized.replace("\"", "&quot;");
        sanitized = sanitized.replace("'", "&#39;");
        return sanitized;
    }

    /**
     * Thông báo khi có hợp đồng mới chờ phê duyệt
     */
    public void notifyContractPendingApproval(Integer contractId, String contractCode) {
        String safeContractCode = sanitizeForNotification(contractCode);
        Map<String, Object> metadata = Map.of("contractCode", safeContractCode);
        notifyAdminsNewApprovalRequest(
                "CONTRACT_PENDING",
                "Hợp đồng mới chờ phê duyệt",
                "Hợp đồng " + safeContractCode + " đang chờ được phê duyệt",
                contractId,
                metadata
        );
    }

    /**
     * Thông báo khi hợp đồng được phê duyệt
     */
    public void notifyContractApproved(UUID userId, Integer contractId, String contractCode) {
        notifyUserApprovalResult(
                userId,
                "CONTRACT_APPROVED",
                "Hợp đồng đã được phê duyệt",
                "Hợp đồng " + contractCode + " của bạn đã được phê duyệt",
                contractId,
                true
        );
    }

    /**
     * Thông báo khi hợp đồng bị từ chối
     */
    public void notifyContractRejected(UUID userId, Integer contractId, String contractCode, String reason) {
        notifyUserApprovalResult(
                userId,
                "CONTRACT_REJECTED",
                "Hợp đồng bị từ chối",
                "Hợp đồng " + contractCode + " đã bị từ chối. Lý do: " + reason,
                contractId,
                false
        );
    }

    // ==================== CONTRACT RENEWAL APPROVAL ====================

    /**
     * Thông báo khi có yêu cầu gia hạn chờ phê duyệt
     */
    public void notifyRenewalPendingApproval(Integer renewalId, String contractCode) {
        Map<String, Object> metadata = Map.of("contractCode", contractCode);
        notifyAdminsNewApprovalRequest(
                "RENEWAL_PENDING",
                "Yêu cầu gia hạn mới",
                "Hợp đồng " + contractCode + " có yêu cầu gia hạn chờ phê duyệt",
                renewalId,
                metadata
        );
    }

    /**
     * Thông báo khi yêu cầu gia hạn được phê duyệt
     */
    public void notifyRenewalApproved(UUID userId, Integer renewalId, String contractCode) {
        notifyUserApprovalResult(
                userId,
                "RENEWAL_APPROVED",
                "Yêu cầu gia hạn đã được phê duyệt",
                "Yêu cầu gia hạn hợp đồng " + contractCode + " đã được chấp thuận",
                renewalId,
                true
        );
    }

    /**
     * Thông báo khi yêu cầu gia hạn bị từ chối
     */
    public void notifyRenewalRejected(UUID userId, Integer renewalId, String contractCode, String reason) {
        notifyUserApprovalResult(
                userId,
                "RENEWAL_REJECTED",
                "Yêu cầu gia hạn bị từ chối",
                "Yêu cầu gia hạn hợp đồng " + contractCode + " đã bị từ chối. Lý do: " + reason,
                renewalId,
                false
        );
    }

    // ==================== CREDIT VERIFICATION ====================

    /**
     * Thông báo khi có carbon credit mới chờ xác minh
     */
    public void notifyCreditPendingVerification(Integer creditId, String creditCode) {
        Map<String, Object> metadata = Map.of("creditCode", creditCode);
        notifyAdminsNewApprovalRequest(
                "CREDIT_PENDING_VERIFICATION",
                "Carbon Credit mới chờ xác minh",
                "Carbon Credit " + creditCode + " đang chờ được xác minh",
                creditId,
                metadata
        );
    }

    /**
     * Thông báo khi credit được xác minh và phân bổ
     */
    public void notifyCreditVerified(UUID userId, Integer creditId, String creditCode) {
        notifyUserApprovalResult(
                userId,
                "CREDIT_VERIFIED",
                "Carbon Credit đã được xác minh",
                "Carbon Credit " + creditCode + " đã được xác minh và sẵn sàng sử dụng",
                creditId,
                true
        );
    }

    // ==================== PAYMENT CONFIRMATION ====================

    /**
     * Thông báo khi thanh toán được xác nhận
     */
    public void notifyPaymentConfirmed(UUID userId, Integer paymentId, String amount) {
        notifyUserApprovalResult(
                userId,
                "PAYMENT_CONFIRMED",
                "Thanh toán đã được xác nhận",
                "Thanh toán " + amount + " VND đã được xác nhận thành công",
                paymentId,
                true
        );
    }
}

