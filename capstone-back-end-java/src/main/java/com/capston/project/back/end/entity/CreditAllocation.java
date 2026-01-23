package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.AllocationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "credit_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditAllocation {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "credit_id", nullable = false)
	private Integer creditId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "credit_id", insertable = false, updatable = false)
	@JsonIgnore
	private CarbonCredit carbonCredit;

	@Column(name = "contract_id", nullable = false)
	private Integer contractId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_id", insertable = false, updatable = false)
	@JsonIgnore
	private Contract contract;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	// Allocation
	@Column(name = "allocated_credits", nullable = false)
	private Integer allocatedCredits;

	@Column(name = "allocation_percentage", nullable = false, precision = 5, scale = 2)
	private BigDecimal allocationPercentage;

	// Status
	@Column(name = "allocation_status", length = 20)
	@Builder.Default
	private AllocationStatus allocationStatus = AllocationStatus.ALLOCATED; // ALLOCATED, CLAIMED, TRANSFERRED, SOLD

	@Column(name = "allocated_at")
	@Builder.Default
	private OffsetDateTime allocatedAt = OffsetDateTime.now();

	@Column(name = "claimed_at")
	private OffsetDateTime claimedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;
}
