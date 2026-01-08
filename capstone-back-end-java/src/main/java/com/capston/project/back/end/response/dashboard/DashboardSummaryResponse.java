package com.capston.project.back.end.response.dashboard;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {
	// Project Stats
	private Long totalProjects;
	private Long activeProjects;
	private Long completedProjects;

	// Farm Stats
	private Long totalFarms;
	private Long activeFarms;
	private Long totalTrees;
	private Long aliveTrees;

	// Carbon Stats
	private BigDecimal totalCo2Absorbed;        // kg
	private BigDecimal totalCo2AbsorbedTons;    // tons
	private BigDecimal targetCo2;
	private BigDecimal co2CompletionPercentage;

	// Credit Stats
	private Long totalCreditsIssued;
	private Long totalCreditsSold;
	private Long totalCreditsRetired;
	private Long totalCreditsAvailable;

	// Financial Stats
	private BigDecimal totalRevenue;
	private BigDecimal totalContractValue;
	private BigDecimal averageCreditPrice;

	// Contract Stats
	private Long totalContracts;
	private Long activeContracts;
	private Long expiringSoonContracts;

	// Ownership Stats
	private Long totalOwnerships;
	private Long activeOwnerships;

	// Recent activities
	private List<RecentActivityResponse> recentActivities;

	// Charts data
	private List<MonthlyDataResponse> monthlyCo2Data;
	private List<MonthlyDataResponse> monthlyRevenueData;
	private List<ProjectCarbonData> topProjectsByCo2;
}
