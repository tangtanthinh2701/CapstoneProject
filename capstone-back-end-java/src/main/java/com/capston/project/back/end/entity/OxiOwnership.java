package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.OwnershipStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "oxi_ownership")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OxiOwnership {
	@Id
	@GeneratedValue(strategy = GenerationType. IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_id", nullable = false)
	private Contract contract;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "tree_species_id")
	private TreeSpecies treeSpecies;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	@Column(name = "ownership_start_date", nullable = false)
	private LocalDate ownershipStartDate;

	@Column(name = "ownership_end_date", nullable = false)
	private LocalDate ownershipEndDate;

	@Column(name = "carbon_credit_percentage", precision = 5, scale = 2)
	@Builder.Default
	private BigDecimal carbonCreditPercentage = new BigDecimal("100.00");

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20)
	@Builder.Default
	private OwnershipStatus status = OwnershipStatus.PENDING;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Relationships
	@OneToMany(mappedBy = "ownership", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<OwnershipTransfer> transfers = new ArrayList<>();

	@OneToMany(mappedBy = "ownership", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CarbonCreditAllocation> creditAllocations = new ArrayList<>();

	// Helper methods
	public Integer getContractId() {
		return contract != null ? contract.getId() : null;
	}

	public Integer getProjectId() {
		return project != null ? project.getId() : null;
	}

	public boolean isActive() {
		return status == OwnershipStatus.ACTIVE;
	}

	public boolean isExpired() {
		return ownershipEndDate != null && ownershipEndDate.isBefore(LocalDate.now());
	}

	public boolean isExpiringSoon(int days) {
		if (ownershipEndDate == null) return false;
		LocalDate warningDate = LocalDate.now().plusDays(days);
		return ownershipEndDate.isBefore(warningDate) && ownershipEndDate.isAfter(LocalDate.now());
	}
}