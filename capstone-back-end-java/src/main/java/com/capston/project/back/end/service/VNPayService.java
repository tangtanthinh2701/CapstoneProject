package com.capston.project.back.end.service;

import com.capston.project.back.end.request.VNPayRequest;
import com.capston.project.back.end.response.VNPayResponse;

import java.util.Map;
import java.util.UUID;

public interface VNPayService {
    VNPayResponse createPaymentUrl(VNPayRequest request, UUID payerId);

    VNPayResponse processReturn(Map<String, String> params);

    String processIPN(Map<String, String> params);

    VNPayResponse queryTransaction(String txnRef);
}
