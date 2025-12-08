package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPhaseResponse {
	private Integer id;
	private Integer phaseNumber;
	private String phaseName;
	private String description;
	private String phaseStatus;
	private LocalDate startDate;
	private LocalDate endDate;
	private Integer expectedDurationDays;
	private Integer actualDurationDays;
	private BigDecimal budget;
	private BigDecimal actualCost;
	private String notes;
	private List<TreeSpeciesOnPhaseResponse> treeSpecies;
}
