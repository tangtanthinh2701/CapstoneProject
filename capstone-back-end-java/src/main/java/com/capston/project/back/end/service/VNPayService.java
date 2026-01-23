package com.capston.project.back.end.service;

import com.capston.project.back.end.request.VNPayRequest;
import com.capston.project.back.end.response.VNPayResponse;

import java.util.Map;
import java.util.UUID;

public interface VNPayService {

    // Tạo URL thanh toán
    VNPayResponse createPaymentUrl(VNPayRequest request, UUID payerId);

    // Xử lý callback từ VNPay
    VNPayResponse processReturn(Map<String, String> params);

    // Xử lý IPN (Instant Payment Notification) từ VNPay
    String processIPN(Map<String, String> params);

    // Kiểm tra trạng thái giao dịch
    VNPayResponse queryTransaction(String txnRef);
}

