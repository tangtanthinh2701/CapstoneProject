package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.VNPayRequest;
import com.capston.project.back.end.response.VNPayResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VNPayService vnPayService;
    private final UserRepository userRepository;

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Xác nhận thanh toán thủ công (Admin only)
     */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> confirmPayment(@PathVariable Integer id) {
        // TODO: Implement payment confirmation in PaymentService
        log.info("Admin confirming payment: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully", null));
    }

    /**
     * Hoàn tiền (Admin only)
     */
    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> refundPayment(
            @PathVariable Integer id,
            @RequestParam(required = false) String reason) {
        // TODO: Implement refund in PaymentService
        log.info("Admin refunding payment: {} - Reason: {}", id, reason);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", null));
    }

    /**
     * Xem tất cả thanh toán (Admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // TODO: Implement get all payments in PaymentService
        log.info("Admin getting all payments - page: {}, size: {}", page, size);
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", null));
    }

    // ==================== USER ENDPOINTS ====================

    /**
     * Xem lịch sử thanh toán của user
     */
    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<Object>> getMyPayments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = getUserIdFromAuth(authentication);
        log.info("User {} getting their payments", userId);
        // TODO: Implement get user payments in PaymentService
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", null));
    }

    // ==================== VNPAY ENDPOINTS ====================

    /**
     * Tạo URL thanh toán VNPay
     */
    @PostMapping("/vnpay/create")
    public ResponseEntity<VNPayResponse> createVNPayPayment(
            @RequestBody VNPayRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        UUID userId = getUserIdFromAuth(authentication);

        // Get client IP
        String ipAddress = getClientIP(httpRequest);
        request.setIpAddress(ipAddress);

        VNPayResponse response = vnPayService.createPaymentUrl(request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * VNPay redirect sau khi thanh toán (Return URL)
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<VNPayResponse> vnpayReturn(HttpServletRequest request) {
        Map<String, String> params = extractVNPayParams(request);
        VNPayResponse response = vnPayService.processReturn(params);
        return ResponseEntity.ok(response);
    }

    /**
     * VNPay IPN (Instant Payment Notification)
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<String> vnpayIPN(HttpServletRequest request) {
        Map<String, String> params = extractVNPayParams(request);
        String response = vnPayService.processIPN(params);
        return ResponseEntity.ok(response);
    }

    /**
     * Kiểm tra trạng thái giao dịch
     */
    @GetMapping("/vnpay/query/{txnRef}")
    public ResponseEntity<VNPayResponse> queryTransaction(@PathVariable String txnRef) {
        VNPayResponse response = vnPayService.queryTransaction(txnRef);
        return ResponseEntity.ok(response);
    }

    // ==================== HELPER METHODS ====================

    private UUID getUserIdFromAuth(Authentication authentication) {
        if (authentication == null)
            return null;
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private Map<String, String> extractVNPayParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        for (Map.Entry<String, String[]> entry : requestParams.entrySet()) {
            if (entry.getValue() != null && entry.getValue().length > 0) {
                params.put(entry.getKey(), entry.getValue()[0]);
            }
        }
        return params;
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
