package com.capston.project.back.end.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "tree_species_on_phases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpeciesOnPhase {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "phase_id", nullable = false)
	private ProjectPhase phase;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "tree_species_id", nullable = false)
	private TreeSpecies treeSpecies;

	@Column(name = "quantity_planned", nullable = false)
	private Integer quantityPlanned;

	@Column(name = "quantity_actual")
	private Integer quantityActual = 0;

	@Column(name = "quantity_died")
	private Integer quantityDied = 0;

	@Column(name = "cost_per_tree", precision = 15, scale = 2)
	private BigDecimal costPerTree;

	@Column(name = "planting_cost", precision = 15, scale = 2)
	private BigDecimal plantingCost;

	@Column(name = "maintenance_cost_yearly", precision = 15, scale = 2)
	private BigDecimal maintenanceCostYearly;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}
}
