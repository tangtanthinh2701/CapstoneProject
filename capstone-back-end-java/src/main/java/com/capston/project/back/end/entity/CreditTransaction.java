package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.TransactionStatus;
import com.capston.project.back.end.common.TransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "credit_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditTransaction {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "transaction_code", unique = true, nullable = false, length = 50)
	private String transactionCode;

	@Column(name = "credit_id", nullable = false)
	private Integer creditId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "credit_id", insertable = false, updatable = false)
	@JsonIgnore
	private CarbonCredit carbonCredit;

	// Parties
	@Column(name = "seller_id")
	private UUID sellerId;

	@Column(name = "buyer_id", nullable = false)
	private UUID buyerId;

	// Transaction details
	@Column(name = "quantity", nullable = false)
	private Integer quantity;

	@Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalAmount;

	// Type
	@Enumerated(EnumType.STRING)
	@Column(name = "transaction_type", nullable = false, length = 20)
	private TransactionType transactionType; // PURCHASE, RETIREMENT

	// Status
	@Enumerated(EnumType.STRING)
	@Column(name = "transaction_status", length = 20)
	@Builder.Default
	private TransactionStatus transactionStatus = TransactionStatus.COMPLETED;

	// Retirement (if applicable)
	@Column(name = "retirement_reason", columnDefinition = "TEXT")
	private String retirementReason;

	@Column(name = "retirement_certificate_url", length = 500)
	private String retirementCertificateUrl;

	// Dates
	@Column(name = "transaction_date")
	@Builder.Default
	private OffsetDateTime transactionDate = OffsetDateTime.now();

	@Column(name = "retired_at")
	private OffsetDateTime retiredAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;
}