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
public class CreditReportResponse {

	private String reportTitle;
	private LocalDate reportDate;
	private LocalDate fromDate;
	private LocalDate toDate;

	// Summary
	private Long totalCreditsIssued;
	private Long totalCreditsSold;
	private Long totalCreditsRetired;
	private Long totalCreditsAvailable;
	private BigDecimal totalCo2Tons;
	private BigDecimal totalRevenue;
	private BigDecimal averagePrice;

	// By Year
	private List<YearlyCreditDetail> yearlyDetails;

	// By Project
	private List<ProjectCreditDetail> projectDetails;

	// By Status
	private List<StatusDetail> statusDetails;

	// Monthly trend
	private List<MonthlyCreditDetail> monthlyTrend;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class YearlyCreditDetail {
		private Integer year;
		private Long creditsIssued;
		private Long creditsSold;
		private Long creditsRetired;
		private Long creditsAvailable;
		private BigDecimal co2Tons;
		private BigDecimal revenue;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectCreditDetail {
		private Integer projectId;
		private String projectCode;
		private String projectName;
		private Long creditsIssued;
		private Long creditsSold;
		private Long creditsRetired;
		private BigDecimal co2Tons;
		private BigDecimal revenue;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class StatusDetail {
		private String status;
		private Long count;
		private Long totalCredits;
		private BigDecimal percentage;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthlyCreditDetail {
		private Integer year;
		private Integer month;
		private String monthName;
		private Long creditsIssued;
		private Long creditsSold;
		private Long creditsRetired;
		private BigDecimal revenue;
	}
}
