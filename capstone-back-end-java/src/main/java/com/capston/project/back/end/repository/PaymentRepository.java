package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.PaymentStatus;
import com.capston.project.back.end.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);

    Optional<Payment> findByPaymentCode(String paymentCode);

    Page<Payment> findByPayerIdOrderByCreatedAtDesc(UUID payerId, Pageable pageable);

    Page<Payment> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus status, Pageable pageable);

    Long countByPaymentStatus(PaymentStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = 'COMPLETED'")
    java.math.BigDecimal sumTotalRevenue();
}
