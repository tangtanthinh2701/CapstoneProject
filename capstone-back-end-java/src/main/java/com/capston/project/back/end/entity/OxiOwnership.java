package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "oxi_ownership")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OxiOwnership {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id", nullable = false)
	private User owner;

	@Column(name = "ownership_start_date", nullable = false)
	private LocalDate ownershipStartDate;

	@Column(name = "ownership_end_date", nullable = false)
	private LocalDate ownershipEndDate;

	@Column(name = "carbon_credit_percentage", precision = 5, scale = 2)
	@Builder.Default
	private BigDecimal carbonCreditPercentage = BigDecimal.valueOf(100.00);

	@Column(name = "status", length = 20)
	@Builder.Default
	private String status = "ACTIVE";

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "ownership", fetch = FetchType.LAZY)
	@Builder.Default
	private List<OwnershipTransfer> transfers = new ArrayList<>();

	@OneToMany(mappedBy = "ownership", fetch = FetchType.LAZY)
	@Builder.Default
	private List<CarbonCreditAllocation> creditAllocations = new ArrayList<>();

	public boolean isActive() {
		return "ACTIVE".equals(status) && LocalDate.now().isBefore(ownershipEndDate);
	}

	public boolean isExpired() {
		return LocalDate.now().isAfter(ownershipEndDate);
	}

	public long getRemainingDays() {
		return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), ownershipEndDate);
	}

	public void expire() {
		this.status = "EXPIRED";
	}

	public void transfer() {
		this.status = "TRANSFERRED";
	}

	public void terminate() {
		this.status = "TERMINATED";
	}
}