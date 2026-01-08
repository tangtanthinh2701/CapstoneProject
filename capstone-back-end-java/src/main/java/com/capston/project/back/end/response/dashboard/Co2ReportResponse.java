package com.capston.project.back.end.response.dashboard;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Co2ReportResponse {

	private String reportTitle;
	private LocalDate reportDate;
	private LocalDate fromDate;
	private LocalDate toDate;

	// Summary
	private BigDecimal totalCo2AbsorbedKg;
	private BigDecimal totalCo2AbsorbedTons;
	private BigDecimal targetCo2Kg;
	private BigDecimal completionPercentage;

	// By Project
	private List<ProjectCo2Detail> projectDetails;

	// By Farm
	private List<FarmCo2Detail> farmDetails;

	// By Tree Species
	private List<SpeciesCo2Detail> speciesDetails;

	// Monthly trend
	private List<MonthlyDataResponse> monthlyTrend;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectCo2Detail {
		private Integer projectId;
		private String projectCode;
		private String projectName;
		private BigDecimal co2Absorbed;
		private BigDecimal targetCo2;
		private BigDecimal percentage;
		private Long totalTrees;
		private Long totalFarms;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class FarmCo2Detail {
		private Integer farmId;
		private String farmCode;
		private String farmName;
		private String location;
		private BigDecimal co2Absorbed;
		private Long totalTrees;
		private Long aliveTrees;
		private BigDecimal area;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class SpeciesCo2Detail {
		private Integer speciesId;
		private String speciesName;
		private String scientificName;
		private BigDecimal carbonAbsorptionRate;
		private Long totalTrees;
		private BigDecimal totalCo2Absorbed;
		private BigDecimal percentage;
	}
}