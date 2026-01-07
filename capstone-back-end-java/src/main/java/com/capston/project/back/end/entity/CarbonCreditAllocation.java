package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_credit_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCreditAllocation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "credit_id", nullable = false)
	private CarbonCredit credit;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ownership_id", nullable = false)
	private OxiOwnership ownership;

	@Column(name = "allocated_credits", nullable = false)
	private Integer allocatedCredits;

	@Column(name = "percentage", precision = 5, scale = 2, nullable = false)
	private BigDecimal percentage;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id", nullable = false)
	private User owner;

	@Column(name = "status", length = 50)
	@Builder.Default
	private String status = "ALLOCATED";

	@Column(name = "claimed_at")
	private LocalDateTime claimedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	public void claim() {
		this.status = "CLAIMED";
		this.claimedAt = LocalDateTime.now();
	}

	public void sell() {
		this.status = "SOLD";
	}

	public void retire() {
		this.status = "RETIRED";
	}

	public boolean isClaimed() {
		return "CLAIMED".equals(status);
	}

	public boolean isAvailable() {
		return "ALLOCATED".equals(status);
	}
}
