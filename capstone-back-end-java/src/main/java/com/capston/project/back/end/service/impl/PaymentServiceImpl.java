package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.config.payment.VNPayConfig;
import com.capston.project.back.end.entity.Payment;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.PaymentRepository;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.VNPayRequest;
import com.capston.project.back.end.response.VNPayResponse;
import com.capston.project.back.end.service.PaymentService;
import com.capston.project.back.end.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final VNPayService vnPayService;
    private final UserRepository userRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
            @Qualifier("vnPayService") VNPayService vnPayService,
            UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.vnPayService = vnPayService;
        this.userRepository = userRepository;
    }

    @Transactional
    public String createPayment(HttpServletRequest request, BigDecimal amount, String bankCode, String orderInfo) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VNPayRequest vnpRequest = VNPayRequest.builder()
                .amount(amount)
                .description(orderInfo)
                .bankCode(bankCode)
                .ipAddress(VNPayConfig.getIpAddress(request))
                .build();

        VNPayResponse response = vnPayService.createPaymentUrl(vnpRequest, user.getId());

        return response.getPaymentUrl();
    }

    @Transactional
    public Payment handleVnpayCallback(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String key = parameterNames.nextElement();
            String value = request.getParameter(key);
            params.put(key, value);
        }

        VNPayResponse response = vnPayService.processReturn(params);

        if (response.getPaymentId() != null) {
            return paymentRepository.findById(response.getPaymentId())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
        }

        return paymentRepository.findByVnpTxnRef(response.getTxnRef())
                .orElseThrow(() -> new RuntimeException("Payment not found for TxnRef: " + response.getTxnRef()));
    }

    public Page<Payment> getMyPayments(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentRepository.findByPayerIdOrderByCreatedAtDesc(user.getId(), pageable);
    }
}
