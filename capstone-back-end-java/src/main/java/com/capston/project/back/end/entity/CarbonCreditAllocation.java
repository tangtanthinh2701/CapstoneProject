package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.AllocationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

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

	@ManyToOne(fetch = FetchType. LAZY)
	@JoinColumn(name = "credit_id", nullable = false)
	@JsonIgnore
	private CarbonCredit carbonCredit;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ownership_id", nullable = false)
	@JsonIgnore
	private OxiOwnership ownership;

	@Column(name = "allocated_credits", nullable = false)
	private Integer allocatedCredits;

	@Column(name = "percentage", nullable = false, precision = 5, scale = 2)
	private BigDecimal percentage;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 50)
	@Builder.Default
	private AllocationStatus status = AllocationStatus.ALLOCATED;

	@Column(name = "claimed_at")
	private OffsetDateTime claimedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	// Helper methods
	public Integer getCreditId() {
		return carbonCredit != null ? carbonCredit.getId() : null;
	}

	public Integer getOwnershipId() {
		return ownership != null ? ownership.getId() : null;
	}
}
