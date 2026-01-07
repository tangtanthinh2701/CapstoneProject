package com.capston.project.back.end.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableTreesResponse {
	private Integer farmId;
	private String farmName;
	private String farmLocation;

	private Integer treesFarmId;
	private Integer treeSpeciesId;
	private String treeSpeciesName;
	private String scientificName;

	private Integer availableTrees;
	private LocalDate plantingDate;
	private Integer ageInMonths;
	private Integer ageInYears;

	private BigDecimal carbonAbsorptionRate;
	private BigDecimal estimatedCarbonPerTree;
	private BigDecimal totalAvailableCarbon;

	private BigDecimal suggestedUnitPrice;

	// Environment factors
	private BigDecimal environmentalFactor;
}
