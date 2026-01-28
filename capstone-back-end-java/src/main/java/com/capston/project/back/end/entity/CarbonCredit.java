package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.CreditStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "carbon_credits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCredit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "credit_code", unique = true, nullable = false, length = 50)
	private String creditCode;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", insertable = false, updatable = false)
	private Project project;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "origins", columnDefinition = "jsonb")
	private List<Map<String, Object>> origins; // List of {farmId, batchId, quantity}

	// Issuance details
	@Column(name = "issuance_year", nullable = false)
	private Integer issuanceYear;

	@Column(name = "total_co2_tons", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalCo2Tons;

	@Column(name = "credits_issued", nullable = false)
	private Integer creditsIssued; // 1 credit = 1 ton CO2

	// Pricing
	@Column(name = "base_price_per_credit", precision = 15, scale = 2)
	private BigDecimal basePricePerCredit;

	@Column(name = "current_price_per_credit", precision = 15, scale = 2)
	private BigDecimal currentPricePerCredit;

	// Status tracking
	@Column(name = "credits_available", nullable = false)
	private Integer creditsAvailable;

	@Column(name = "credits_allocated")
	@Builder.Default
	private Integer creditsAllocated = 0;

	@Column(name = "credits_sold")
	@Builder.Default
	private Integer creditsSold = 0;

	@Column(name = "credits_retired")
	@Builder.Default
	private Integer creditsRetired = 0;

	@Enumerated(EnumType.STRING)
	@Column(name = "credit_status", length = 20)
	@Builder.Default
	private CreditStatus creditStatus = CreditStatus.AVAILABLE;

	// Verification
	@Column(name = "verification_standard", length = 100)
	private String verificationStandard; // VCS, Gold Standard, etc.

	@Column(name = "verification_date")
	private LocalDate verificationDate;

	@Column(name = "certificate_url", length = 500)
	private String certificateUrl;

	@Column(name = "verifier_user_id")
	private UUID verifierUserId;

	// Expiry
	@Column(name = "issued_at")
	@Builder.Default
	private OffsetDateTime issuedAt = OffsetDateTime.now();

	@Column(name = "expires_at")
	private OffsetDateTime expiresAt;

	// Tracking
	@Column(name = "issued_by")
	private UUID issuedBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Relationships
	@OneToMany(mappedBy = "carbonCredit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CreditAllocation> allocations = new ArrayList<>();

	@OneToMany(mappedBy = "carbonCredit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CreditTransaction> transactions = new ArrayList<>();

	// Helper methods
	public boolean hasAvailableCredits() {
		return creditsAvailable != null && creditsAvailable > 0;
	}

	public boolean canSell(int quantity) {
		return hasAvailableCredits() && creditsAvailable >= quantity;
	}

	public void sellCredits(int qty) {
		if (!canSell(qty)) {
			throw new IllegalStateException("Not enough credits available");
		}
		this.creditsSold += qty;
		this.creditsAvailable -= qty;
		updateStatus();
	}

	public void retireCredits(int qty) {
		if (!canSell(qty)) {
			throw new IllegalStateException("Not enough credits available");
		}
		this.creditsRetired += qty;
		this.creditsAvailable -= qty;
		updateStatus();
	}

	private void updateStatus() {
		if (creditsAvailable <= 0) {
			this.creditStatus = CreditStatus.SOLD_OUT;
		} else if (creditsSold > 0 || creditsRetired > 0) {
			this.creditStatus = CreditStatus.PARTIALLY_SOLD;
		}
	}

	public boolean isExpired() {
		return expiresAt != null && expiresAt.isBefore(OffsetDateTime.now());
	}
}
