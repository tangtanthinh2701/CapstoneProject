package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.CreditStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(name = "report_year", nullable = false)
	private Integer reportYear;

	@Column(name = "total_co2_tons", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalCo2Tons;

	@Column(name = "credits_issued", nullable = false)
	private Integer creditsIssued;

	@Column(name = "credits_sold")
	@Builder.Default
	private Integer creditsSold = 0;

	@Column(name = "credits_retired")
	@Builder.Default
	private Integer creditsRetired = 0;

	@Column(name = "credits_available", nullable = false)
	private Integer creditsAvailable;

	@Column(name = "price_per_credit", precision = 15, scale = 2)
	private BigDecimal pricePerCredit;

	@Enumerated(EnumType.STRING)
	@Column(name = "credits_status", length = 50)
	@Builder.Default
	private CreditStatus creditsStatus = CreditStatus. PENDING;

	@Column(name = "verification_standard", length = 100)
	private String verificationStandard; // VCS, Gold Standard, etc.

	@Column(name = "certificate_url", length = 500)
	private String certificateUrl;

	@Column(name = "issued_by")
	private UUID issuedBy;

	@Column(name = "issued_at")
	private OffsetDateTime issuedAt;

	@Column(name = "expires_at")
	private OffsetDateTime expiresAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Relationships
	@OneToMany(mappedBy = "carbonCredit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CarbonCreditAllocation> allocations = new ArrayList<>();

	@OneToMany(mappedBy = "carbonCredit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CreditTransaction> transactions = new ArrayList<>();

	// Helper methods
	public Integer getProjectId() {
		return project != null ? project.getId() : null;
	}

	public boolean hasAvailableCredits() {
		return creditsAvailable != null && creditsAvailable > 0;
	}

	public boolean canSell(int quantity) {
		return hasAvailableCredits() && creditsAvailable >= quantity;
	}

	public void sellCredits(int quantity) {
		if (! canSell(quantity)) {
			throw new IllegalStateException("Not enough credits available");
		}
		this.creditsSold += quantity;
		this.creditsAvailable -= quantity;
		updateStatus();
	}

	public void retireCredits(int quantity) {
		if (!canSell(quantity)) {
			throw new IllegalStateException("Not enough credits available");
		}
		this.creditsRetired += quantity;
		this.creditsAvailable -= quantity;
		updateStatus();
	}

	private void updateStatus() {
		if (creditsAvailable <= 0) {
			this.creditsStatus = CreditStatus.SOLD_OUT;
		} else if (creditsSold > 0 || creditsRetired > 0) {
			this.creditsStatus = CreditStatus.PARTIALLY_SOLD;
		}
	}

	public boolean isExpired() {
		return expiresAt != null && expiresAt.isBefore(OffsetDateTime. now());
	}
}
