package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.NotificationType;
import com.capston.project.back.end.common.PaymentStatus;
import com.capston.project.back.end.common.ReferenceType;
import com.capston.project.back.end.config.payment.VNPayConfig;
import com.capston.project.back.end.entity.Payment;
import com.capston.project.back.end.repository.PaymentRepository;
import com.capston.project.back.end.request.VNPayRequest;
import com.capston.project.back.end.response.VNPayResponse;
import com.capston.project.back.end.service.NotificationService;
import com.capston.project.back.end.service.VNPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service("vnPayService")
@RequiredArgsConstructor
@Slf4j
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    @Transactional
    public VNPayResponse createPaymentUrl(VNPayRequest request, UUID payerId) {
        log.info("Creating VNPay payment URL for amount: {}", request.getAmount());

        // Generate unique transaction reference
        String txnRef = generateTxnRef();

        // Create payment record
        Payment payment = Payment.builder()
                .paymentCode("PAY-" + txnRef)
                .payerId(payerId)
                .amount(request.getAmount())
                .currency("VND")
                .paymentMethod("VNPAY")
                .paymentGateway("VNPAY")
                .vnpTxnRef(txnRef)
                .paymentStatus(PaymentStatus.PENDING)
                .contractId(request.getContractId())
                .creditTransactionId(request.getCreditTransactionId())
                .notes(request.getDescription())
                .build();

        paymentRepository.save(payment);

        // Build VNPay URL
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVnp_Version());
        vnpParams.put("vnp_Command", vnPayConfig.getVnp_Command());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(request.getAmount().multiply(BigDecimal.valueOf(100)).longValue()));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo",
                request.getDescription() != null ? request.getDescription() : "Thanh toan don hang " + txnRef);
        vnpParams.put("vnp_OrderType", vnPayConfig.getVnp_OrderType());
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnpParams.put("vnp_IpAddr", request.getIpAddress() != null ? request.getIpAddress() : "127.0.0.1");
        vnpParams.put("vnp_CreateDate", OffsetDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).format(DATE_FORMATTER));

        if (request.getBankCode() != null && !request.getBankCode().isEmpty()) {
            vnpParams.put("vnp_BankCode", request.getBankCode());
        }

        // Build query string and hash
        String queryString = buildQueryString(vnpParams);
        String secureHash = hmacSHA512(vnPayConfig.getVnp_HashSecret(), queryString);
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        log.info("VNPay payment URL created for txnRef: {}", txnRef);

        return VNPayResponse.builder()
                .success(true)
                .message("Payment URL created successfully")
                .paymentUrl(paymentUrl)
                .txnRef(txnRef)
                .paymentId(payment.getId())
                .build();
    }

    @Override
    @Transactional
    public VNPayResponse processReturn(Map<String, String> params) {
        log.info("Processing VNPay return: {}", params);

        // Verify secure hash
        String vnpSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String signValue = buildQueryString(new TreeMap<>(params));
        String calculatedHash = hmacSHA512(vnPayConfig.getVnp_HashSecret(), signValue);

        if (!calculatedHash.equals(vnpSecureHash)) {
            log.error("Invalid secure hash");
            return VNPayResponse.builder()
                    .success(false)
                    .message("Invalid secure hash")
                    .build();
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");

        Payment payment = paymentRepository.findByVnpTxnRef(txnRef)
                .orElse(null);

        if (payment == null) {
            log.error("Payment not found for txnRef: {}", txnRef);
            return VNPayResponse.builder()
                    .success(false)
                    .message("Payment not found")
                    .txnRef(txnRef)
                    .build();
        }

        // Update payment
        payment.setVnpTransactionNo(transactionNo);
        payment.setVnpResponseCode(responseCode);
        payment.setVnpBankCode(bankCode);

        boolean isSuccess = "00".equals(responseCode);

        if (isSuccess) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setCompletedAt(OffsetDateTime.now());
            payment.setPaymentDate(OffsetDateTime.now());

            // Send notification
            notificationService.createAndSend(
                    payment.getPayerId(),
                    "Thanh toán thành công",
                    "Thanh toán " + payment.getAmount() + " VND đã được xử lý thành công.",
                    NotificationType.PAYMENT_RECEIVED,
                    ReferenceType.PAYMENT,
                    payment.getId(),
                    Map.of("amount", payment.getAmount(), "txnRef", txnRef));
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);

            notificationService.createAndSend(
                    payment.getPayerId(),
                    "Thanh toán thất bại",
                    "Thanh toán " + payment.getAmount() + " VND không thành công. Mã lỗi: " + responseCode,
                    NotificationType.PAYMENT_FAILED,
                    ReferenceType.PAYMENT,
                    payment.getId(),
                    Map.of("responseCode", responseCode));
        }

        paymentRepository.save(payment);

        return VNPayResponse.builder()
                .success(isSuccess)
                .message(isSuccess ? "Payment successful" : "Payment failed")
                .responseCode(responseCode)
                .txnRef(txnRef)
                .transactionNo(transactionNo)
                .paymentId(payment.getId())
                .build();
    }

    @Override
    @Transactional
    public String processIPN(Map<String, String> params) {
        log.info("Processing VNPay IPN: {}", params);

        // Verify secure hash
        String vnpSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String signValue = buildQueryString(new TreeMap<>(params));
        String calculatedHash = hmacSHA512(vnPayConfig.getVnp_HashSecret(), signValue);

        if (!calculatedHash.equals(vnpSecureHash)) {
            return "{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}";
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findByVnpTxnRef(txnRef).orElse(null);

        if (payment == null) {
            return "{\"RspCode\":\"01\",\"Message\":\"Order not Found\"}";
        }

        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            return "{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}";
        }

        // Update payment
        payment.setVnpTransactionNo(params.get("vnp_TransactionNo"));
        payment.setVnpResponseCode(responseCode);
        payment.setVnpBankCode(params.get("vnp_BankCode"));

        if ("00".equals(responseCode)) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setCompletedAt(OffsetDateTime.now());
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);

        return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
    }

    @Override
    public VNPayResponse queryTransaction(String txnRef) {
        Payment payment = paymentRepository.findByVnpTxnRef(txnRef).orElse(null);

        if (payment == null) {
            return VNPayResponse.builder()
                    .success(false)
                    .message("Transaction not found")
                    .build();
        }

        return VNPayResponse.builder()
                .success(true)
                .txnRef(txnRef)
                .transactionNo(payment.getVnpTransactionNo())
                .responseCode(payment.getVnpResponseCode())
                .paymentId(payment.getId())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus().name())
                .build();
    }

    // ==================== HELPER METHODS ====================

    private String generateTxnRef() {
        return String.valueOf(System.currentTimeMillis());
    }

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (sb.length() > 0) {
                    sb.append("&");
                }
                sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
                sb.append("=");
                sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Error generating HMAC SHA512", e);
            return "";
        }
    }
}
