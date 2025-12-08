package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpeciesOnPhaseResponse {
	private Integer id;
	private TreeSpeciesSimpleResponse treeSpecies;
	private Integer quantityPlanned;
	private Integer quantityActual;
	private Integer quantityDied;
	private BigDecimal costPerTree;
	private BigDecimal plantingCost;
	private BigDecimal maintenanceCostYearly;
	private String notes;
}
