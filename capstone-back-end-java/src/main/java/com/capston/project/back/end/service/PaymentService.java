package com.capston.project.back.end.service;

import com.capston.project.back.end.entity.Payment;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface PaymentService {
    String createPayment(HttpServletRequest request, BigDecimal amount, String bankCode, String orderInfo);

    Payment handleVnpayCallback(HttpServletRequest request);

    Page<Payment> getMyPayments(Pageable pageable);
}
