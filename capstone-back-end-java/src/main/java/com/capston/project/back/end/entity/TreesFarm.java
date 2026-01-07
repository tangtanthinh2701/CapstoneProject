package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.HealthStatus;
import com.capston.project.back.end.common.TreeStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "trees_farm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreesFarm {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "farm_id", nullable = false)
	@JsonIgnore
	private Farm farm;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "tree_species_id", nullable = false)
	private TreeSpecies treeSpecies;

	@Column(name = "number_trees", nullable = false)
	@Builder.Default
	private Integer numberTrees = 1;

	@Column(name = "latitude", precision = 10, scale = 8)
	private BigDecimal latitude;

	@Column(name = "longitude", precision = 11, scale = 8)
	private BigDecimal longitude;

	@Column(name = "planting_date", nullable = false)
	private LocalDate plantingDate;

	// Thông tin hiện tại (cập nhật từ growth_records)
	@Column(name = "current_avg_height", precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal currentAvgHeight = BigDecimal.ZERO;

	@Column(name = "current_avg_trunk_diameter", precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal currentAvgTrunkDiameter = BigDecimal.ZERO;

	@Column(name = "current_avg_canopy_diameter", precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal currentAvgCanopyDiameter = BigDecimal.ZERO;

	@Enumerated(EnumType.STRING)
	@Column(name = "current_avg_health_status", length = 20)
	@Builder.Default
	private HealthStatus currentAvgHealthStatus = HealthStatus.HEALTHY;

	// CO2 hấp thụ
	@Column(name = "total_co2_absorbed", precision = 15, scale = 4)
	@Builder.Default
	private BigDecimal totalCo2Absorbed = BigDecimal.ZERO;

	// Status
	@Enumerated(EnumType.STRING)
	@Column(name = "tree_status", length = 20)
	@Builder.Default
	private TreeStatus treeStatus = TreeStatus.ALIVE;

	// Số cây còn lại có thể bán
	@Column(name = "available_trees")
	@Builder.Default
	private Integer availableTrees = 0;

	// Tracking
	@Column(name = "created_by")
	private UUID createdBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Helper methods
	public Integer getFarmId() {
		return farm != null ? farm.getId() : null;
	}

	public Integer getTreeSpeciesId() {
		return treeSpecies != null ? treeSpecies.getId() : null;
	}

	/**
	 * Tính tuổi cây (năm)
	 */
	public int getAgeInYears() {
		if (plantingDate == null) return 0;
		return (int) ChronoUnit.YEARS.between(plantingDate, LocalDate.now());
	}

	/**
	 * Tính tuổi cây (tháng)
	 */
	public int getAgeInMonths() {
		if (plantingDate == null) return 0;
		return (int) ChronoUnit.MONTHS.between(plantingDate, LocalDate.now());
	}

	/**
	 * Tính CO2 ước tính cho mỗi cây
	 */
	public BigDecimal getEstimatedCarbonPerTree() {
		if (treeSpecies == null) return BigDecimal.ZERO;
		return treeSpecies.calculateEstimatedCarbon(getAgeInYears());
	}

	/**
	 * Tính tổng CO2 ước tính cho tất cả cây còn sống
	 */
	public BigDecimal getTotalEstimatedCarbon() {
		return getEstimatedCarbonPerTree().multiply(BigDecimal.valueOf(availableTrees));
	}

	/**
	 * Khởi tạo số cây available = số cây trồng
	 */
	@PostPersist
	@PostLoad
	public void initAvailableTrees() {
		if (availableTrees == null || availableTrees == 0) {
			availableTrees = numberTrees;
		}
	}
}