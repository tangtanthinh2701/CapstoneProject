package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payments {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "payment_code", unique = true, nullable = false, length = 50)
	private String paymentCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_id")
	private Contracts contract;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "credit_transaction_id")
	private CreditTransactions creditTransaction;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "payer_id", nullable = false)
	private User payer;

	@Column(nullable = false, precision = 15, scale = 2)
	private BigDecimal amount;

	@Column(name = "payment_method", length = 50)
	private String paymentMethod;

	@Column(name = "payment_status", length = 50)
	private String paymentStatus = "PENDING";

	@Column(name = "transaction_id")
	private String transactionId;

	@Column(name = "bank_name", length = 100)
	private String bankName;

	@Column(name = "account_number", length = 50)
	private String accountNumber;

	@Column(name = "paid_at")
	private OffsetDateTime paidAt;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;
}
