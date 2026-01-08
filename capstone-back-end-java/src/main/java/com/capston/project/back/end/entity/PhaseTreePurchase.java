package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.PurchaseStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org. hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time. LocalDate;
import java.time. OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "phase_tree_purchases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhaseTreePurchase {
	@Id
	@GeneratedValue(strategy = GenerationType. IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType. LAZY)
	@JoinColumn(name = "phase_id", nullable = false)
	@JsonIgnore
	private ProjectPhase phase;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "farm_id", nullable = false)
	private Farm farm;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "tree_species_id", nullable = false)
	private TreeSpecies treeSpecies;

	@Column(name = "quantity", nullable = false)
	private Integer quantity;

	@Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "total_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalPrice;

	@Column(name = "estimated_carbon_per_tree", nullable = false, precision = 10, scale = 4)
	private BigDecimal estimatedCarbonPerTree;

	@Column(name = "total_estimated_carbon", nullable = false, precision = 15, scale = 4)
	private BigDecimal totalEstimatedCarbon;

	@Column(name = "actual_carbon_absorbed", precision = 15, scale = 4)
	@Builder.Default
	private BigDecimal actualCarbonAbsorbed = BigDecimal.ZERO;

	@Enumerated(EnumType.STRING)
	@Column(name = "purchase_status", length = 20)
	@Builder.Default
	private PurchaseStatus purchaseStatus = PurchaseStatus.PENDING;

	@Column(name = "purchase_date")
	private LocalDate purchaseDate;

	@Column(name = "delivery_date")
	private LocalDate deliveryDate;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@Column(name = "created_by")
	private UUID createdBy;

	@Column(name = "approved_by")
	private UUID approvedBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Helper methods
	public Integer getPhaseId() {
		return phase != null ? phase.getId() : null;
	}

	public Integer getFarmId() {
		return farm != null ? farm.getId() : null;
	}

	public Integer getTreeSpeciesId() {
		return treeSpecies != null ? treeSpecies. getId() : null;
	}

	@PrePersist
	@PreUpdate
	public void calculateTotals() {
		if (quantity != null && unitPrice != null) {
			this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
		}
		if (quantity != null && estimatedCarbonPerTree != null) {
			this.totalEstimatedCarbon = estimatedCarbonPerTree.multiply(BigDecimal.valueOf(quantity));
		}
	}
}
