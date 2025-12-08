package com.capston.project.back.end.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Table(name = "annual_growth_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class AnnualGrowthData {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "tree_species_id", nullable = false)
	private TreeSpecies treeSpecies;

	@Column(name = "report_year", nullable = false)
	private Integer reportYear;

	@Column(name = "trees_alive", nullable = false)
	private Integer treesAlive;

	@Column(name = "avg_height", precision = 10, scale = 2)
	private BigDecimal avgHeight;

	@Column(name = "avg_canopy_diameter", precision = 10, scale = 2)
	private BigDecimal avgCanopyDiameter;

	@Column(name = "avg_trunk_diameter", precision = 10, scale = 2)
	private BigDecimal avgTrunkDiameter;

	@Column(name = "survival_rate", precision = 5, scale = 4)
	private BigDecimal survivalRate;

	@Column(name = "health_status", length = 50)
	private String healthStatus; // EXCELLENT, GOOD, FAIR, POOR

	@Column(columnDefinition = "TEXT")
	private String diseases;

	@Column(name = "co2_absorbed", precision = 15, scale = 2)
	private BigDecimal co2Absorbed; // kg - Tự động tính

	@Column(columnDefinition = "TEXT")
	private String notes;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recorded_by")
	private User recordedBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;
}
