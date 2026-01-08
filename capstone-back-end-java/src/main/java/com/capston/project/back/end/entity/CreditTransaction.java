package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.TransactionStatus;
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "credit_id", nullable = false)
	@JsonIgnore
	private CarbonCredit carbonCredit;

	@Column(name = "enterprise_id", nullable = false)
	private UUID enterpriseId;

	@Column(name = "quantity", nullable = false)
	private Integer quantity;

	@Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalAmount;

	@Enumerated(EnumType.STRING)
	@Column(name = "transaction_status", length = 50)
	@Builder.Default
	private TransactionStatus transactionStatus = TransactionStatus.PURCHASED;

	@Column(name = "certificate_url", length = 500)
	private String certificateUrl;

	@Column(name = "retirement_reason", columnDefinition = "TEXT")
	private String retirementReason;

	@Column(name = "purchased_at")
	@Builder.Default
	private OffsetDateTime purchasedAt = OffsetDateTime.now();

	@Column(name = "retired_at")
	private OffsetDateTime retiredAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	// Helper methods
	public Integer getCreditId() {
		return carbonCredit != null ? carbonCredit.getId() : null;
	}
}