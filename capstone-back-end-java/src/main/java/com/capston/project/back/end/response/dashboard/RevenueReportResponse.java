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
public class RevenueReportResponse {

	private String reportTitle;
	private LocalDate reportDate;
	private LocalDate fromDate;
	private LocalDate toDate;

	// Summary
	private BigDecimal totalRevenue;
	private BigDecimal creditSalesRevenue;
	private BigDecimal contractRevenue;
	private Long totalTransactions;

	// By Project
	private List<ProjectRevenueDetail> projectDetails;

	// By Month
	private List<MonthlyRevenueDetail> monthlyDetails;

	// Top Buyers
	private List<TopBuyerDetail> topBuyers;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectRevenueDetail {
		private Integer projectId;
		private String projectCode;
		private String projectName;
		private BigDecimal creditRevenue;
		private BigDecimal contractRevenue;
		private BigDecimal totalRevenue;
		private Long creditsSold;
		private Long transactionCount;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthlyRevenueDetail {
		private Integer year;
		private Integer month;
		private String monthName;
		private BigDecimal creditRevenue;
		private BigDecimal contractRevenue;
		private BigDecimal totalRevenue;
		private Long transactionCount;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class TopBuyerDetail {
		private String enterpriseId;
		private BigDecimal totalSpent;
		private Long creditsPurchased;
		private Long creditsRetired;
		private Long transactionCount;
	}
}
