package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.repository.CarbonCreditRepository;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeGrowthRecordRepository;
import com.capston.project.back.end.response.dashboard.Co2ReportResponse;
import com.capston.project.back.end.response.dashboard.CreditReportResponse;
import com.capston.project.back.end.response.dashboard.ReportFilterRequest;
import com.capston.project.back.end.response.dashboard.RevenueReportResponse;
import com.capston.project.back.end.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

	private final ProjectRepository projectRepository;
	private final FarmRepository farmRepository;
	private final CarbonCreditRepository creditRepository;
	private final TreeGrowthRecordRepository growthRecordRepository;

	@Override
	public Co2ReportResponse getCo2Report(ReportFilterRequest filter) {
		log.info("Generating CO2 report with filter: {}", filter);

		return Co2ReportResponse.builder()
		                        .reportTitle("CO2 Absorption Report")
		                        .reportDate(LocalDate.now())
		                        .totalCo2AbsorbedKg(BigDecimal.ZERO)
		                        .totalCo2AbsorbedTons(BigDecimal.ZERO)
		                        .targetCo2Kg(BigDecimal.ZERO)
		                        .completionPercentage(BigDecimal.ZERO)
		                        .projectDetails(new ArrayList<>())
		                        .farmDetails(new ArrayList<>())
		                        .speciesDetails(new ArrayList<>())
		                        .monthlyTrend(new ArrayList<>())
		                        .build();
	}

	@Override
	public Co2ReportResponse getCo2ReportByProject(Integer projectId, ReportFilterRequest filter) {
		log.info("Generating CO2 report for project: {}", projectId);

		return Co2ReportResponse.builder()
		                        .reportTitle("Project CO2 Report")
		                        .reportDate(LocalDate.now())
		                        .totalCo2AbsorbedKg(BigDecimal.ZERO)
		                        .totalCo2AbsorbedTons(BigDecimal.ZERO)
		                        .targetCo2Kg(BigDecimal.ZERO)
		                        .completionPercentage(BigDecimal.ZERO)
		                        .projectDetails(new ArrayList<>())
		                        .farmDetails(new ArrayList<>())
		                        .speciesDetails(new ArrayList<>())
		                        .monthlyTrend(new ArrayList<>())
		                        .build();
	}

	@Override
	public Co2ReportResponse getCo2ReportByFarm(Integer farmId, ReportFilterRequest filter) {
		log.info("Generating CO2 report for farm: {}", farmId);

		return Co2ReportResponse.builder()
		                        .reportTitle("Farm CO2 Report")
		                        .reportDate(LocalDate.now())
		                        .totalCo2AbsorbedKg(BigDecimal.ZERO)
		                        .totalCo2AbsorbedTons(BigDecimal.ZERO)
		                        .targetCo2Kg(BigDecimal.ZERO)
		                        .completionPercentage(BigDecimal.ZERO)
		                        .farmDetails(new ArrayList<>())
		                        .speciesDetails(new ArrayList<>())
		                        .monthlyTrend(new ArrayList<>())
		                        .build();
	}

	@Override
	public RevenueReportResponse getRevenueReport(ReportFilterRequest filter) {
		log.info("Generating revenue report with filter: {}", filter);

		return RevenueReportResponse.builder()
		                            .reportTitle("Revenue Report")
		                            .reportDate(LocalDate.now())
		                            .totalRevenue(BigDecimal.ZERO)
		                            .totalTransactions(0L)
		                            .build();
	}

	@Override
	public RevenueReportResponse getRevenueReportByProject(Integer projectId, ReportFilterRequest filter) {
		log.info("Generating revenue report for project: {}", projectId);

		return RevenueReportResponse.builder()
		                            .reportTitle("Project Revenue Report")
		                            .reportDate(LocalDate.now())
		                            .totalRevenue(BigDecimal.ZERO)
		                            .totalTransactions(0L)
		                            .build();
	}

	@Override
	public CreditReportResponse getCreditReport(ReportFilterRequest filter) {
		log.info("Generating credit report with filter: {}", filter);

		return CreditReportResponse.builder()
		                           .reportTitle("Credit Report")
		                           .reportDate(LocalDate.now())
		                           .totalCreditsIssued(0L)
		                           .totalCreditsSold(0L)
		                           .totalCreditsRetired(0L)
		                           .totalCreditsAvailable(0L)
		                           .build();
	}

	@Override
	public CreditReportResponse getCreditReportByProject(Integer projectId, ReportFilterRequest filter) {
		log.info("Generating credit report for project: {}", projectId);

		return CreditReportResponse.builder()
		                           .reportTitle("Project Credit Report")
		                           .reportDate(LocalDate.now())
		                           .totalCreditsIssued(0L)
		                           .totalCreditsSold(0L)
		                           .totalCreditsRetired(0L)
		                           .totalCreditsAvailable(0L)
		                           .build();
	}
}

