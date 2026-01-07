package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
	private CarbonCredit credit;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "enterprise_id", nullable = false)
	private User enterprise;

	@Column(name = "quantity", nullable = false)
	private Integer quantity;

	@Column(name = "unit_price", precision = 15, scale = 2, nullable = false)
	private BigDecimal unitPrice;

	@Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
	private BigDecimal totalAmount;

	@Column(name = "transaction_status", length = 50)
	@Builder.Default
	private String transactionStatus = "PURCHASED";

	@Column(name = "certificate_url", length = 500)
	private String certificateUrl;

	@Column(name = "retirement_reason", columnDefinition = "TEXT")
	private String retirementReason;

	@Column(name = "purchased_at")
	@Builder.Default
	private LocalDateTime purchasedAt = LocalDateTime.now();

	@Column(name = "retired_at")
	private LocalDateTime retiredAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "creditTransaction", fetch = FetchType.LAZY)
	@Builder.Default
	private List<Payment> payments = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		if (purchasedAt == null) {
			purchasedAt = LocalDateTime.now();
		}
		calculateTotalAmount();
	}

	@PreUpdate
	protected void onUpdate() {
		calculateTotalAmount();
	}

	private void calculateTotalAmount() {
		if (quantity != null && unitPrice != null) {
			this.totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));
		}
	}

	public void retire(String reason) {
		this.transactionStatus = "RETIRED";
		this.retirementReason = reason;
		this.retiredAt = LocalDateTime.now();
	}

	public boolean isRetired() {
		return "RETIRED".equals(transactionStatus);
	}

	public boolean isPurchased() {
		return "PURCHASED".equals(transactionStatus);
	}
}