package com.capston.project.back.end.response;

import com.capston.project.back.end.common.HealthStatus;
import com.capston.project.back.end.common.TreeStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreesFarmResponse {
	private Integer id;
	private Integer farmId;
	private String farmName;

	// Tree species info
	private Integer treeSpeciesId;
	private String treeSpeciesName;
	private String scientificName;
	private BigDecimal carbonAbsorptionRate;

	// Quantity
	private Integer numberTrees;
	private Integer availableTrees;
	private Integer soldTrees;

	// Location
	private BigDecimal latitude;
	private BigDecimal longitude;

	// Dates
	private LocalDate plantingDate;
	private Integer ageInYears;
	private Integer ageInMonths;

	// Current measurements
	private BigDecimal currentAvgHeight;
	private BigDecimal currentAvgTrunkDiameter;
	private BigDecimal currentAvgCanopyDiameter;
	private HealthStatus currentAvgHealthStatus;

	// Carbon
	private BigDecimal estimatedCarbonPerTree;
	private BigDecimal totalEstimatedCarbon;
	private BigDecimal totalCo2Absorbed;

	// Status
	private TreeStatus treeStatus;

	// Tracking
	private UUID createdBy;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
