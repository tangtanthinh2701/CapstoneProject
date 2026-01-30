package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.BatchStatus;
import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.repository.CarbonCreditRepository;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeBatchRepository;
import com.capston.project.back.end.response.dashboard.DashboardSummaryResponse;
import com.capston.project.back.end.response.dashboard.MonthlyDataResponse;
import com.capston.project.back.end.response.dashboard.ProjectCarbonData;
import com.capston.project.back.end.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

	private final ProjectRepository projectRepository;
	private final FarmRepository farmRepository;
	private final TreeBatchRepository treeBatchRepository;
	private final CarbonCreditRepository creditRepository;
	private final com.capston.project.back.end.repository.PaymentRepository paymentRepository;

	@Override
	public DashboardSummaryResponse getDashboardSummary() {
		log.info("Generating dashboard summary");

		// Project stats
		long totalProjects = projectRepository.count();
		long activeProjects = projectRepository.countByProjectStatus(ProjectStatus.ACTIVE);
		long completedProjects = projectRepository.countByProjectStatus(ProjectStatus.COMPLETED);

		// Farm stats
		long totalFarms = farmRepository.countByDeletedAtIsNull();
		long activeFarms = farmRepository.countByFarmStatusAndDeletedAtIsNull(FarmStatus.ACTIVE);

		// Tree stats (from tree_batches)
		Long totalTrees = treeBatchRepository.findByBatchStatus(BatchStatus.ACTIVE, Pageable.ofSize(Integer.MAX_VALUE))
				.stream()
				.mapToLong(b -> b.getQuantityPlanted() != null ? b.getQuantityPlanted() : 0)
				.sum();

		// Credit stats
		Long creditsIssued = creditRepository.sumCreditsIssued();
		Long creditsSold = creditRepository.sumCreditsSold();
		Long creditsRetired = creditRepository.sumCreditsRetired();

		// Actual CO2 absorbed
		BigDecimal totalCo2AbsorbedKg = projectRepository.sumActualCo2Kg();
		BigDecimal totalCo2AbsorbedTons = totalCo2AbsorbedKg != null
				? totalCo2AbsorbedKg.divide(new BigDecimal(1000), 2, java.math.RoundingMode.HALF_UP)
				: BigDecimal.ZERO;

		// Total Revenue
		BigDecimal totalRevenue = paymentRepository.sumTotalRevenue();

		return DashboardSummaryResponse.builder()
				.totalProjects(totalProjects)
				.activeProjects(activeProjects)
				.completedProjects(completedProjects)
				.totalFarms(totalFarms)
				.activeFarms(activeFarms)
				.totalTrees(totalTrees)
				.totalCo2Absorbed(totalCo2AbsorbedKg != null ? totalCo2AbsorbedKg : BigDecimal.ZERO)
				.totalCo2AbsorbedTons(totalCo2AbsorbedTons)
				.totalCreditsIssued(creditsIssued != null ? creditsIssued : 0L)
				.totalCreditsSold(creditsSold != null ? creditsSold : 0L)
				.totalCreditsRetired(creditsRetired != null ? creditsRetired : 0L)
				.totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
				.build();
	}

	@Override
	public List<MonthlyDataResponse> getMonthlyCo2Data(Integer year) {
		log.info("Fetching monthly CO2 data for year: {}", year);
		return new ArrayList<>();
	}

	@Override
	public List<MonthlyDataResponse> getMonthlyRevenueData(Integer year) {
		log.info("Fetching monthly revenue data for year: {}", year);
		return new ArrayList<>();
	}

	@Override
	public List<ProjectCarbonData> getTopProjectsByCo2(int limit) {
		return List.of();
	}

	@Override
	public DashboardSummaryResponse getDashboardSummaryByProject(Integer projectId) {
		log.info("Generating dashboard summary for project: {}", projectId);

		if (projectId == null) {
			log.warn("Project id is null, returning global dashboard summary");
			return getDashboardSummary();
		}

		if (!projectRepository.existsById(projectId)) {
			return DashboardSummaryResponse.builder()
					.totalProjects(0L)
					.activeProjects(0L)
					.completedProjects(0L)
					.totalFarms(0L)
					.activeFarms(0L)
					.totalTrees(0L)
					.totalCo2Absorbed(BigDecimal.ZERO)
					.totalCo2AbsorbedTons(BigDecimal.ZERO)
					.totalCreditsIssued(0L)
					.totalCreditsSold(0L)
					.totalCreditsRetired(0L)
					.totalRevenue(BigDecimal.ZERO)
					.build();
		}

		// TODO: Replace with real per-project metrics once repository methods are
		// available.
		// For now, reuse the global dashboard summary for existing projects.
		return getDashboardSummary();
	}
}
