package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCO2SummaryResponse {
	private Integer projectId;
	private String projectName;
	private Integer reportYear;
	private BigDecimal totalCO2AbsorbedKg;
	private BigDecimal totalCO2AbsorbedTons;
	private List<AnnualGrowthDataResponse> treeSpeciesDetails;
}
