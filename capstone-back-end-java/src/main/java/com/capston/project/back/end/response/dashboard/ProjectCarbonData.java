package com.capston.project.back.end.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCarbonData {
	private Integer projectId;
	private String projectCode;
	private String projectName;
	private BigDecimal totalCo2Absorbed;
	private BigDecimal targetCo2;
	private BigDecimal completionPercentage;
	private Long totalTrees;
	private Long totalCreditsIssued;
}
