package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.entity.CarbonCredit;
import com.capston.project.back.end.entity.Farm;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.repository.CarbonCreditRepository;
import com.capston.project.back.end.repository.ContractRepository;
import com.capston.project.back.end.repository.CreditTransactionRepository;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.repository.TreesFarmRepository;
import com.capston.project.back.end.response.dashboard.Co2ReportResponse;
import com.capston.project.back.end.response.dashboard.CreditReportResponse;
import com.capston.project.back.end.response.dashboard.MonthlyDataResponse;
import com.capston.project.back.end.response.dashboard.ReportFilterRequest;
import com.capston.project.back.end.response.dashboard.RevenueReportResponse;
import com.capston.project.back.end.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math. RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java. util.*;
import java.util. stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

	private final ProjectRepository projectRepository;
	private final FarmRepository farmRepository;
	private final TreesFarmRepository treesFarmRepository;
	private final TreeSpeciesRepository treeSpeciesRepository;
	private final CarbonCreditRepository creditRepository;
	private final CreditTransactionRepository transactionRepository;
	private final ContractRepository contractRepository;

	// ==================== CO2 REPORTS ====================

	@Override
	public Co2ReportResponse getCo2Report(ReportFilterRequest filter) {
		log.info("Generating CO2 report");

		LocalDate fromDate = filter.getFromDate() != null ? filter.getFromDate() : LocalDate.now().minusYears(1);
		LocalDate toDate = filter.getToDate() != null ? filter.getToDate() : LocalDate.now();

		// Total CO2
		BigDecimal totalCo2Kg = treesFarmRepository.sumTotalCo2Absorbed();
		if (totalCo2Kg == null) totalCo2Kg = BigDecimal. ZERO;
		BigDecimal totalCo2Tons = totalCo2Kg.divide(new BigDecimal("1000"), 2, RoundingMode. HALF_UP);

		BigDecimal targetCo2 = projectRepository.sumTargetConsumedCarbon();
		if (targetCo2 == null) targetCo2 = BigDecimal.ZERO;

		BigDecimal completion = targetCo2.compareTo(BigDecimal.ZERO) > 0 ?
		                        totalCo2Kg.divide(targetCo2, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
		                        BigDecimal.ZERO;

		// By Project
		List<Co2ReportResponse. ProjectCo2Detail> projectDetails = getProjectCo2Details(filter);

		// By Farm
		List<Co2ReportResponse.FarmCo2Detail> farmDetails = getFarmCo2Details(filter);

		// By Species
		List<Co2ReportResponse.SpeciesCo2Detail> speciesDetails = getSpeciesCo2Details(totalCo2Kg);

		// Monthly trend
		int year = filter.getYear() != null ? filter.getYear() : LocalDate.now().getYear();
		List<MonthlyDataResponse> monthlyTrend = getMonthlyCo2Trend(year);

		return Co2ReportResponse.builder()
		                        .reportTitle("Báo cáo CO2 hấp thụ")
		                        .reportDate(LocalDate.now())
		                        .fromDate(fromDate)
		                        .toDate(toDate)
		                        .totalCo2AbsorbedKg(totalCo2Kg)
		                        .totalCo2AbsorbedTons(totalCo2Tons)
		                        .targetCo2Kg(targetCo2)
		                        .completionPercentage(completion)
		                        .projectDetails(projectDetails)
		                        .farmDetails(farmDetails)
		                        .speciesDetails(speciesDetails)
		                        .monthlyTrend(monthlyTrend)
		                        .build();
	}

	@Override
	public Co2ReportResponse getCo2ReportByProject(Integer projectId, ReportFilterRequest filter) {
		// Filtered report for specific project
		Co2ReportResponse report = getCo2Report(filter);

		// Filter by project
		report.setProjectDetails(
				report.getProjectDetails().stream()
				      .filter(p -> p.getProjectId().equals(projectId))
				      .collect(Collectors.toList())
		                        );

		return report;
	}

	@Override
	public Co2ReportResponse getCo2ReportByFarm(Integer farmId, ReportFilterRequest filter) {
		Co2ReportResponse report = getCo2Report(filter);

		report.setFarmDetails(
				report.getFarmDetails().stream()
				      .filter(f -> f.getFarmId().equals(farmId))
				      .collect(Collectors.toList())
		                     );

		return report;
	}

	// ==================== REVENUE REPORTS ====================

	@Override
	public RevenueReportResponse getRevenueReport(ReportFilterRequest filter) {
		log.info("Generating revenue report");

		LocalDate fromDate = filter.getFromDate() != null ? filter.getFromDate() : LocalDate.now().minusYears(1);
		LocalDate toDate = filter.getToDate() != null ? filter.getToDate() : LocalDate.now();

		// Summary
		BigDecimal totalRevenue = transactionRepository.sumTotalRevenue();
		if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

		BigDecimal contractRevenue = contractRepository.sumTotalAmount();
		if (contractRevenue == null) contractRevenue = BigDecimal.ZERO;

		Long totalTransactions = transactionRepository.count();

		// By Project
		List<RevenueReportResponse.ProjectRevenueDetail> projectDetails = getProjectRevenueDetails();

		// By Month
		int year = filter.getYear() != null ? filter.getYear() : LocalDate.now().getYear();
		List<RevenueReportResponse.MonthlyRevenueDetail> monthlyDetails = getMonthlyRevenueDetails(year);

		// Top Buyers
		List<RevenueReportResponse.TopBuyerDetail> topBuyers = getTopBuyers(10);

		return RevenueReportResponse.builder()
		                            .reportTitle("Báo cáo doanh thu")
		                            .reportDate(LocalDate.now())
		                            .fromDate(fromDate)
		                            .toDate(toDate)
		                            .totalRevenue(totalRevenue.add(contractRevenue))
		                            .creditSalesRevenue(totalRevenue)
		                            .contractRevenue(contractRevenue)
		                            .totalTransactions(totalTransactions)
		                            .projectDetails(projectDetails)
		                            .monthlyDetails(monthlyDetails)
		                            .topBuyers(topBuyers)
		                            .build();
	}

	@Override
	public RevenueReportResponse getRevenueReportByProject(Integer projectId, ReportFilterRequest filter) {
		RevenueReportResponse report = getRevenueReport(filter);

		report.setProjectDetails(report.getProjectDetails()
		                               .stream()
		                               .filter(p -> p.getProjectId().equals(projectId))
		                               .collect(Collectors.toList()));

		return report;
	}

	// ==================== CREDIT REPORTS ====================

	@Override
	public CreditReportResponse getCreditReport(ReportFilterRequest filter) {
		log.info("Generating credit report");

		LocalDate fromDate = filter.getFromDate() != null ? filter.getFromDate() : LocalDate.now().minusYears(1);
		LocalDate toDate = filter.getToDate() != null ? filter.getToDate() : LocalDate.now();

		// Summary
		Long totalIssued = creditRepository.sumTotalCreditsIssued();
		Long totalSold = creditRepository.sumTotalCreditsSold();
		Long totalRetired = creditRepository.sumTotalCreditsRetired();
		Long totalAvailable = creditRepository.sumTotalCreditsAvailable();

		BigDecimal totalCo2Tons = creditRepository.sumTotalCo2Tons();
		if (totalCo2Tons == null) totalCo2Tons = BigDecimal.ZERO;

		BigDecimal totalRevenue = transactionRepository.sumTotalRevenue();
		if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

		BigDecimal avgPrice = transactionRepository.avgPricePerCredit();
		if (avgPrice == null) avgPrice = BigDecimal.ZERO;

		// By Year
		List<CreditReportResponse.YearlyCreditDetail> yearlyDetails = getYearlyCreditDetails();

		// By Project
		List<CreditReportResponse.ProjectCreditDetail> projectDetails = getProjectCreditDetails();

		// By Status
		List<CreditReportResponse.StatusDetail> statusDetails = getCreditStatusDetails(totalIssued != null ? totalIssued : 0L);

		// Monthly trend
		int year = filter. getYear() != null ? filter.getYear() : LocalDate.now().getYear();
		List<CreditReportResponse.MonthlyCreditDetail> monthlyTrend = getMonthlyCreditTrend(year);

		return CreditReportResponse.builder()
		                           .reportTitle("Báo cáo tín chỉ Carbon")
		                           .reportDate(LocalDate.now())
		                           .fromDate(fromDate)
		                           .toDate(toDate)
		                           .totalCreditsIssued(totalIssued != null ? totalIssued : 0L)
		                           .totalCreditsSold(totalSold != null ? totalSold : 0L)
		                           .totalCreditsRetired(totalRetired != null ? totalRetired : 0L)
		                           .totalCreditsAvailable(totalAvailable != null ? totalAvailable : 0L)
		                           .totalCo2Tons(totalCo2Tons)
		                           .totalRevenue(totalRevenue)
		                           .averagePrice(avgPrice)
		                           .yearlyDetails(yearlyDetails)
		                           .projectDetails(projectDetails)
		                           .statusDetails(statusDetails)
		                           .monthlyTrend(monthlyTrend)
		                           .build();
	}

	@Override
	public CreditReportResponse getCreditReportByProject(Integer projectId, ReportFilterRequest filter) {
		CreditReportResponse report = getCreditReport(filter);

		report.setProjectDetails(report.getProjectDetails()
		                               .stream()
		                               .filter(p -> p.getProjectId().equals(projectId))
		                               .collect(Collectors.toList()));

		return report;
	}

	// ==================== HELPER METHODS ====================

	private List<Co2ReportResponse.ProjectCo2Detail> getProjectCo2Details(ReportFilterRequest filter) {
		List<Project> projects = projectRepository.findAll();

		return projects.stream()
		               .map(p -> {
			               BigDecimal co2 = p.getCurrentConsumedCarbon() != null ?
			                                p.getCurrentConsumedCarbon() :
			                                BigDecimal.ZERO;
			               BigDecimal target = p.getTargetConsumedCarbon() != null ?
			                                   p.getTargetConsumedCarbon() :
			                                   BigDecimal.ZERO;
			               BigDecimal pct = target.compareTo(BigDecimal.ZERO) > 0 ?
			                                co2.divide(target, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
			                                BigDecimal.ZERO;

			               Long trees = treesFarmRepository.countTreesByProjectId(p.getId());
			               Long farms = farmRepository.countFarmsByProjectId(p.getId());

			               return Co2ReportResponse.ProjectCo2Detail.builder()
			                                                        .projectId(p.getId())
			                                                        .projectCode(p.getCode())
			                                                        .projectName(p.getName())
			                                                        .co2Absorbed(co2)
			                                                        .targetCo2(target)
			                                                        .percentage(pct)
			                                                        .totalTrees(trees != null ? trees : 0L)
			                                                        .totalFarms(farms != null ? farms : 0L)
			                                                        .build();
		               })
		               .sorted((a, b) -> b.getCo2Absorbed().compareTo(a.getCo2Absorbed()))
		               .collect(Collectors. toList());
	}

	private List<Co2ReportResponse.FarmCo2Detail> getFarmCo2Details(ReportFilterRequest filter) {
		List<Farm> farms = farmRepository.findAllActive();

		return farms.stream()
		            .map(f -> {
			            BigDecimal co2 = treesFarmRepository.sumCarbonAbsorbedByFarmId(f.getId());
			            if (co2 == null) co2 = BigDecimal. ZERO;

			            return Co2ReportResponse.FarmCo2Detail.builder()
			                                                  .farmId(f. getId())
			                                                  .farmCode(f.getCode())
			                                                  .farmName(f.getName())
			                                                  .location(f.getLocation())
			                                                  .co2Absorbed(co2)
			                                                  .totalTrees(f.getTotalTrees() != null ? f.getTotalTrees().longValue() : 0L)
			                                                  .aliveTrees(f.getAliveTrees() != null ? f.getAliveTrees().longValue() : 0L)
			                                                  .area(f.getArea())
			                                                  .build();
		            })
		            .sorted((a, b) -> b.getCo2Absorbed().compareTo(a.getCo2Absorbed()))
		            .collect(Collectors.toList());
	}

	private List<Co2ReportResponse.SpeciesCo2Detail> getSpeciesCo2Details(BigDecimal totalCo2) {
		List<TreeSpecies> species = treeSpeciesRepository.findAllActive();

		return species.stream()
		              .map(s -> {
			              BigDecimal co2 = treesFarmRepository.sumCo2AbsorbedBySpeciesId(s.getId());
			              if (co2 == null) co2 = BigDecimal.ZERO;

			              Long trees = treesFarmRepository.countTreesBySpeciesId(s.getId());

			              BigDecimal pct = totalCo2.compareTo(BigDecimal.ZERO) > 0 ?
			                               co2.divide(totalCo2, 4, RoundingMode. HALF_UP).multiply(new BigDecimal("100")) :
			                               BigDecimal.ZERO;

			              return Co2ReportResponse.SpeciesCo2Detail.builder()
			                                                       .speciesId(s.getId())
			                                                       .speciesName(s.getName())
			                                                       .scientificName(s.getScientificName())
			                                                       .carbonAbsorptionRate(s.getCarbonAbsorptionRate())
			                                                       .totalTrees(trees != null ? trees : 0L)
			                                                       .totalCo2Absorbed(co2)
			                                                       .percentage(pct)
			                                                       .build();
		              })
		              .sorted((a, b) -> b.getTotalCo2Absorbed().compareTo(a.getTotalCo2Absorbed()))
		              .collect(Collectors.toList());
	}

	private List<MonthlyDataResponse> getMonthlyCo2Trend(int year) {
		List<MonthlyDataResponse> result = new ArrayList<>();

		for (int month = 1; month <= 12; month++) {
			String monthName = Month.of(month).getDisplayName(TextStyle.SHORT, Locale. ENGLISH);
			BigDecimal co2 = treesFarmRepository.sumCo2AbsorbedByMonth(year, month);
			if (co2 == null) co2 = BigDecimal.ZERO;

			result.add(MonthlyDataResponse.builder()
			                              .year(year)
			                              .month(month)
			                              .monthName(monthName)
			                              .value(co2)
			                              .build());
		}

		return result;
	}

	private List<RevenueReportResponse.ProjectRevenueDetail> getProjectRevenueDetails() {
		List<Project> projects = projectRepository. findAll();

		return projects.stream()
		               .map(p -> {
			               BigDecimal creditRev = transactionRepository.sumRevenueByProjectId(p. getId());
			               if (creditRev == null) creditRev = BigDecimal.ZERO;

			               BigDecimal contractRev = contractRepository.sumAmountByProjectId(p.getId());
			               if (contractRev == null) contractRev = BigDecimal.ZERO;

			               Long creditsSold = creditRepository.sumCreditsSoldByProjectId(p.getId());
			               Long txnCount = transactionRepository.countByProjectId(p.getId());

			               return RevenueReportResponse.ProjectRevenueDetail.builder()
			                                                                .projectId(p.getId())
			                                                                .projectCode(p.getCode())
			                                                                .projectName(p.getName())
			                                                                .creditRevenue(creditRev)
			                                                                .contractRevenue(contractRev)
			                                                                .totalRevenue(creditRev.add(contractRev))
			                                                                .creditsSold(creditsSold != null ? creditsSold : 0L)
			                                                                .transactionCount(txnCount != null ? txnCount : 0L)
			                                                                .build();
		               })
		               .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
		               .collect(Collectors.toList());
	}

	private List<RevenueReportResponse. MonthlyRevenueDetail> getMonthlyRevenueDetails(int year) {
		List<RevenueReportResponse.MonthlyRevenueDetail> result = new ArrayList<>();

		for (int month = 1; month <= 12; month++) {
			String monthName = Month.of(month).getDisplayName(TextStyle. SHORT, Locale.ENGLISH);

			BigDecimal creditRev = transactionRepository.sumRevenueByMonth(year, month);
			if (creditRev == null) creditRev = BigDecimal. ZERO;

			// Contract revenue by month would need additional implementation
			BigDecimal contractRev = BigDecimal.ZERO;

			Long txnCount = transactionRepository.countByMonth(year, month);

			result.add(RevenueReportResponse.MonthlyRevenueDetail.builder()
			                                                     .year(year)
			                                                     .month(month)
			                                                     .monthName(monthName)
			                                                     .creditRevenue(creditRev)
			                                                     .contractRevenue(contractRev)
			                                                     .totalRevenue(creditRev.add(contractRev))
			                                                     .transactionCount(txnCount != null ? txnCount : 0L)
			                                                     .build());
		}

		return result;
	}

	private List<RevenueReportResponse.TopBuyerDetail> getTopBuyers(int limit) {
		List<Object[]> results = transactionRepository.findTopBuyers(limit);

		return results.stream()
		              .map(r -> RevenueReportResponse.TopBuyerDetail.builder()
		                                                            .enterpriseId(r[0].toString())
		                                                            .totalSpent((BigDecimal) r[1])
		                                                            .creditsPurchased(((Number) r[2]).longValue())
		                                                            .creditsRetired(((Number) r[3]).longValue())
		                                                            .transactionCount(((Number) r[4]).longValue())
		                                                            .build())
		              .collect(Collectors.toList());
	}

	private List<CreditReportResponse.YearlyCreditDetail> getYearlyCreditDetails() {
		List<Integer> years = creditRepository.findDistinctYears();

		return years.stream()
		            .map(year -> {
			            List<CarbonCredit> credits = creditRepository.findByReportYear(year);

			            long issued = credits.stream().mapToLong(CarbonCredit::getCreditsIssued).sum();
			            long sold = credits.stream().mapToLong(CarbonCredit::getCreditsSold).sum();
			            long retired = credits.stream().mapToLong(CarbonCredit:: getCreditsRetired).sum();
			            long available = credits. stream().mapToLong(CarbonCredit::getCreditsAvailable).sum();

			            BigDecimal co2 = credits.stream()
			                                    .map(CarbonCredit::getTotalCo2Tons)
			                                    .reduce(BigDecimal.ZERO, BigDecimal::add);

			            BigDecimal revenue = transactionRepository.sumRevenueByYear(year);
			            if (revenue == null) revenue = BigDecimal.ZERO;

			            return CreditReportResponse.YearlyCreditDetail.builder()
			                                                          .year(year)
			                                                          .creditsIssued(issued)
			                                                          .creditsSold(sold)
			                                                          .creditsRetired(retired)
			                                                          .creditsAvailable(available)
			                                                          .co2Tons(co2)
			                                                          .revenue(revenue)
			                                                          .build();
		            })
		            .sorted((a, b) -> b.getYear().compareTo(a.getYear()))
		            .collect(Collectors.toList());
	}

	private List<CreditReportResponse.ProjectCreditDetail> getProjectCreditDetails() {
		List<Project> projects = projectRepository.findAll();

		return projects.stream()
		               .map(p -> {
			               List<CarbonCredit> credits = creditRepository.findByProjectId(p.getId());

			               long issued = credits.stream().mapToLong(CarbonCredit::getCreditsIssued).sum();
			               long sold = credits.stream().mapToLong(CarbonCredit:: getCreditsSold).sum();
			               long retired = credits.stream().mapToLong(CarbonCredit::getCreditsRetired).sum();

			               BigDecimal co2 = credits.stream()
			                                       .map(CarbonCredit::getTotalCo2Tons)
			                                       .reduce(BigDecimal.ZERO, BigDecimal::add);

			               BigDecimal revenue = transactionRepository.sumRevenueByProjectId(p.getId());
			               if (revenue == null) revenue = BigDecimal.ZERO;

			               return CreditReportResponse.ProjectCreditDetail.builder()
			                                                              .projectId(p.getId())
			                                                              .projectCode(p.getCode())
			                                                              .projectName(p. getName())
			                                                              .creditsIssued(issued)
			                                                              .creditsSold(sold)
			                                                              .creditsRetired(retired)
			                                                              .co2Tons(co2)
			                                                              .revenue(revenue)
			                                                              .build();
		               })
		               .sorted((a, b) -> Long.compare(b.getCreditsIssued(), a.getCreditsIssued()))
		               .collect(Collectors.toList());
	}

	private List<CreditReportResponse.StatusDetail> getCreditStatusDetails(long totalCredits) {
		List<CreditReportResponse.StatusDetail> result = new ArrayList<>();

		for (CreditStatus status : CreditStatus.values()) {
			Long count = creditRepository.countByCreditsStatus(status);
			if (count == null) count = 0L;

			Long credits = creditRepository.sumCreditsByStatus(status);
			if (credits == null) credits = 0L;

			BigDecimal pct = totalCredits > 0 ?
			                 BigDecimal.valueOf(credits)
			                           .divide(BigDecimal.valueOf(totalCredits), 4, RoundingMode.HALF_UP)
			                           .multiply(new BigDecimal("100")) :
			                 BigDecimal.ZERO;

			result.add(CreditReportResponse.StatusDetail.builder()
			                                            .status(status. name())
			                                            .count(count)
			                                            .totalCredits(credits)
			                                            .percentage(pct)
			                                            .build());
		}

		return result;
	}

	private List<CreditReportResponse.MonthlyCreditDetail> getMonthlyCreditTrend(int year) {
		List<CreditReportResponse.MonthlyCreditDetail> result = new ArrayList<>();

		for (int month = 1; month <= 12; month++) {
			String monthName = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

			Long issued = creditRepository.sumCreditsIssuedByMonth(year, month);
			Long sold = creditRepository.sumCreditsSoldByMonth(year, month);
			Long retired = creditRepository.sumCreditsRetiredByMonth(year, month);

			BigDecimal revenue = transactionRepository.sumRevenueByMonth(year, month);
			if (revenue == null) revenue = BigDecimal.ZERO;

			result.add(CreditReportResponse.MonthlyCreditDetail.builder()
			                                                   .year(year)
			                                                   .month(month)
			                                                   .monthName(monthName)
			                                                   .creditsIssued(issued != null ? issued : 0L)
			                                                   .creditsSold(sold != null ? sold : 0L)
			                                                   .creditsRetired(retired != null ? retired : 0L)
			                                                   .revenue(revenue)
			                                                   .build());
		}

		return result;
	}
}
