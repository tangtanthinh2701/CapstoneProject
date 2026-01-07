package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

	@Column(name = "total_co2_tons", precision = 15, scale = 2, nullable = false)
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

	@Column(name = "credits_status", length = 50)
	@Builder.Default
	private String creditsStatus = "AVAILABLE";

	@Column(name = "verification_standard", length = 100)
	private String verificationStandard;

	@Column(name = "certificate_url", length = 500)
	private String certificateUrl;

	@Column(name = "issued_by")
	private UUID issuedBy;

	@Column(name = "issued_at")
	@Builder.Default
	private LocalDateTime issuedAt = LocalDateTime.now();

	@Column(name = "expires_at")
	private LocalDateTime expiresAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "credit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CarbonCreditAllocation> allocations = new ArrayList<>();

	@OneToMany(mappedBy = "credit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CreditTransaction> transactions = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		if (issuedAt == null) {
			issuedAt = LocalDateTime.now();
		}
		if (creditsAvailable == null) {
			creditsAvailable = creditsIssued;
		}
	}

	public void sellCredits(int quantity) {
		if (quantity > creditsAvailable) {
			throw new IllegalArgumentException("Not enough credits available");
		}
		this.creditsSold += quantity;
		this.creditsAvailable -= quantity;
		updateStatus();
	}

	public void retireCredits(int quantity) {
		if (quantity > creditsAvailable) {
			throw new IllegalArgumentException("Not enough credits available");
		}
		this.creditsRetired += quantity;
		this.creditsAvailable -= quantity;
		updateStatus();
	}

	private void updateStatus() {
		if (creditsAvailable <= 0) {
			this.creditsStatus = "SOLD_OUT";
		} else {
			this.creditsStatus = "AVAILABLE";
		}
	}

	public boolean isAvailable() {
		return "AVAILABLE".equals(creditsStatus) && creditsAvailable > 0;
	}

	public boolean isExpired() {
		return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
	}

	public BigDecimal getTotalValue() {
		if (pricePerCredit == null) {
			return BigDecimal.ZERO;
		}
		return pricePerCredit.multiply(BigDecimal.valueOf(creditsAvailable));
	}
}
