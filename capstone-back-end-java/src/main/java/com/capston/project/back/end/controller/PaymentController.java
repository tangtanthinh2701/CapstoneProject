package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.Payment;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 1. Tạo yêu cầu thanh toán VNPay
    @PostMapping("/vnpay/create-payment")
    public ResponseEntity<ApiResponse<String>> createPayment(
            HttpServletRequest request,
            @RequestParam long amount,
            @RequestParam(defaultValue = "NCB") String bankCode,
            @RequestParam(defaultValue = "Thanh toan don hang") String orderInfo) {

        String paymentUrl = paymentService.createPayment(request, BigDecimal.valueOf(amount), bankCode, orderInfo);

        return ResponseEntity.ok(ApiResponse.success("Payment URL generated successfully", paymentUrl));
    }

    // 2. Xử lý Return URL (User được redirect về đây sau khi thanh toán xong)
    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<Payment>> vnpayReturn(HttpServletRequest request) {
        Payment payment = paymentService.handleVnpayCallback(request);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", payment));
    }

    // 3. Xử lý IPN (Server-to-Server callback từ VNPay - cần public IP hoặc ngrok)
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<ApiResponse<Payment>> vnpayIpn(HttpServletRequest request) {
        Payment payment = paymentService.handleVnpayCallback(request);
        return ResponseEntity.ok(ApiResponse.success("IPN processed successfully", payment));
    }

    // 4. Lấy danh sách giao dịch của user
    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<Object>> getMyPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Payment> paymentPage = paymentService
                .getMyPayments(PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return ResponseEntity.ok(ApiResponse.<Object>builder()
                .success(true)
                .message("Payments retrieved successfully")
                .data(paymentPage.getContent())
                .timestamp(java.time.LocalDateTime.now())
                .build()); // Tạm thời trả về content, thực tế nên build PageInfo
    }
}
