package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "credit_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditTransactions {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "transaction_code", unique = true, nullable = false, length = 50)
	private String transactionCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "credit_id", nullable = false)
	private CarbonCredits credit;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "enterprise_id", nullable = false)
	private User enterprise;

	@Column(nullable = false)
	private Integer quantity;

	@Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalAmount;

	@Column(name = "transaction_status", length = 50)
	private String transactionStatus = "PURCHASED";

	@Column(name = "certificate_url", length = 500)
	private String certificateUrl;

	@Column(name = "retirement_reason", columnDefinition = "TEXT")
	private String retirementReason;

	@Column(name = "purchased_at")
	private OffsetDateTime purchasedAt;

	@Column(name = "retired_at")
	private OffsetDateTime retiredAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;
}
