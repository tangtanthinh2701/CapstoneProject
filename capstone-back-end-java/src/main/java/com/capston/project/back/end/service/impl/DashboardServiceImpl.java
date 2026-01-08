package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.common.OwnershipStatus;
import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.entity.CarbonCredit;
import com.capston.project.back.end.entity.Contract;
import com.capston.project.back.end.entity.CreditTransaction;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.repository.CarbonCreditRepository;
import com.capston.project.back.end.repository.ContractRepository;
import com.capston.project.back.end.repository.CreditTransactionRepository;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.OxiOwnershipRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreesFarmRepository;
import com.capston.project.back.end.response.dashboard.DashboardSummaryResponse;
import com.capston.project.back.end.response.dashboard.MonthlyDataResponse;
import com.capston.project.back.end.response.dashboard.ProjectCarbonData;
import com.capston.project.back.end.response.dashboard.RecentActivityResponse;
import com.capston.project.back.end.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.OffsetDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream. Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

	private final ProjectRepository projectRepository;
	private final FarmRepository farmRepository;
	private final TreesFarmRepository treesFarmRepository;
	private final ContractRepository contractRepository;
	private final OxiOwnershipRepository ownershipRepository;
	private final CarbonCreditRepository creditRepository;
	private final CreditTransactionRepository transactionRepository;

	@Override
	public DashboardSummaryResponse getDashboardSummary() {
		log.info("Generating dashboard summary");
		List<ProjectStatus> activeStatuses = Arrays.asList(ProjectStatus.PLANTING,
		                                                   ProjectStatus.GROWING,
		                                                   ProjectStatus.MATURE,
		                                                   ProjectStatus.HARVESTING);
		// Project stats
		long totalProjects = projectRepository.count();
		long activeProjects = projectRepository.countByProjectStatusIn(activeStatuses);
		long completedProjects = projectRepository.countByProjectStatus(ProjectStatus.COMPLETED);

		// Farm stats
		long totalFarms = farmRepository.countByDeletedAtIsNull();
		long activeFarms = farmRepository.countByFarmStatusAndDeletedAtIsNull(FarmStatus.ACTIVE);

		// Tree stats
		List<Object[]> treeStats = treesFarmRepository.getTreeStats();
		long totalTrees = 0L;
		long aliveTrees = 0L;
		if (!treeStats.isEmpty()) {
			Object[] stats = treeStats.get(0);
			totalTrees = stats[0] != null ? ((Number) stats[0]).longValue() : 0L;
			aliveTrees = stats[1] != null ? ((Number) stats[1]).longValue() : 0L;
		}

		// Carbon stats
		BigDecimal totalCo2Absorbed = treesFarmRepository.sumTotalCo2Absorbed();
		if (totalCo2Absorbed == null) totalCo2Absorbed = BigDecimal.ZERO;
		BigDecimal totalCo2Tons = totalCo2Absorbed.divide(new BigDecimal("1000"), 2, RoundingMode.HALF_UP);

		BigDecimal targetCo2 = projectRepository.sumTargetConsumedCarbon();
		if (targetCo2 == null) targetCo2 = BigDecimal. ZERO;

		BigDecimal co2Completion = targetCo2.compareTo(BigDecimal.ZERO) > 0 ?
		                           totalCo2Absorbed.divide(targetCo2, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
		                           BigDecimal. ZERO;

		// Credit stats
		Long totalCreditsIssued = creditRepository.sumTotalCreditsIssued();
		Long totalCreditsSold = creditRepository.sumTotalCreditsSold();
		Long totalCreditsRetired = creditRepository.sumTotalCreditsRetired();
		Long totalCreditsAvailable = creditRepository.sumTotalCreditsAvailable();

		// Financial stats
		BigDecimal totalRevenue = transactionRepository.sumTotalRevenue();
		if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

		BigDecimal totalContractValue = contractRepository.sumTotalAmount();
		if (totalContractValue == null) totalContractValue = BigDecimal.ZERO;

		BigDecimal avgCreditPrice = transactionRepository.avgPricePerCredit();
		if (avgCreditPrice == null) avgCreditPrice = BigDecimal.ZERO;

		// Contract stats
		long totalContracts = contractRepository.count();
		long activeContracts = contractRepository.countByStatus(ContractStatus.ACTIVE);
		long expiringSoon = contractRepository.countByStatus(ContractStatus.EXPIRING_SOON);

		// Ownership stats
		long totalOwnerships = ownershipRepository.count();
		long activeOwnerships = ownershipRepository.countByStatus(OwnershipStatus.ACTIVE);

		// Recent activities
		List<RecentActivityResponse> recentActivities = getRecentActivities(10);

		// Charts data
		int currentYear = LocalDate.now().getYear();
		List<MonthlyDataResponse> monthlyCo2 = getMonthlyCo2Data(currentYear);
		List<MonthlyDataResponse> monthlyRevenue = getMonthlyRevenueData(currentYear);
		List<ProjectCarbonData> topProjects = getTopProjectsByCo2(5);

		return DashboardSummaryResponse.builder()
		                               .totalProjects(totalProjects)
		                               .activeProjects(activeProjects)
		                               .completedProjects(completedProjects)
		                               .totalFarms(totalFarms)
		                               .activeFarms(activeFarms)
		                               .totalTrees(totalTrees)
		                               .aliveTrees(aliveTrees)
		                               .totalCo2Absorbed(totalCo2Absorbed)
		                               .totalCo2AbsorbedTons(totalCo2Tons)
		                               .targetCo2(targetCo2)
		                               .co2CompletionPercentage(co2Completion)
		                               .totalCreditsIssued(totalCreditsIssued != null ? totalCreditsIssued : 0L)
		                               .totalCreditsSold(totalCreditsSold != null ? totalCreditsSold : 0L)
		                               .totalCreditsRetired(totalCreditsRetired != null ? totalCreditsRetired : 0L)
		                               .totalCreditsAvailable(totalCreditsAvailable != null ? totalCreditsAvailable :  0L)
		                               .totalRevenue(totalRevenue)
		                               .totalContractValue(totalContractValue)
		                               .averageCreditPrice(avgCreditPrice)
		                               .totalContracts(totalContracts)
		                               .activeContracts(activeContracts)
		                               .expiringSoonContracts(expiringSoon)
		                               .totalOwnerships(totalOwnerships)
		                               .activeOwnerships(activeOwnerships)
		                               .recentActivities(recentActivities)
		                               .monthlyCo2Data(monthlyCo2)
		                               .monthlyRevenueData(monthlyRevenue)
		                               .topProjectsByCo2(topProjects)
		                               .build();
	}

	@Override
	public List<MonthlyDataResponse> getMonthlyCo2Data(Integer year) {
		List<MonthlyDataResponse> result = new ArrayList<>();

		for (int month = 1; month <= 12; month++) {
			String monthName = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

			// Get CO2 absorbed for this month
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

	@Override
	public List<MonthlyDataResponse> getMonthlyRevenueData(Integer year) {
		List<MonthlyDataResponse> result = new ArrayList<>();

		for (int month = 1; month <= 12; month++) {
			String monthName = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

			BigDecimal revenue = transactionRepository.sumRevenueByMonth(year, month);
			if (revenue == null) revenue = BigDecimal.ZERO;

			Long count = transactionRepository.countByMonth(year, month);

			result.add(MonthlyDataResponse.builder()
			                              .year(year)
			                              .month(month)
			                              .monthName(monthName)
			                              .value(revenue)
			                              .count(count)
			                              .build());
		}

		return result;
	}

	@Override
	public List<ProjectCarbonData> getTopProjectsByCo2(int limit) {
		List<Project> projects = projectRepository.findTopProjectsByCo2(limit);

		return projects.stream()
		               .map(p -> {
			               BigDecimal co2 = p.getCurrentConsumedCarbon() != null ?
			                                p.getCurrentConsumedCarbon() :
			                                BigDecimal.ZERO;
			               BigDecimal target = p.getTargetConsumedCarbon() != null ?
			                                   p.getTargetConsumedCarbon() :
			                                   BigDecimal.ZERO;
			               BigDecimal completion = target.compareTo(BigDecimal. ZERO) > 0 ?
			                                       co2.divide(target, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) :
			                                       BigDecimal.ZERO;

			               Long totalTrees = treesFarmRepository.countTreesByProjectId(p.getId());
			               Long totalCredits = creditRepository.sumCreditsIssuedByProjectId(p.getId());

			               return ProjectCarbonData.builder()
			                                       .projectId(p.getId())
			                                       .projectCode(p.getCode())
			                                       .projectName(p.getName())
			                                       .totalCo2Absorbed(co2)
			                                       .targetCo2(target)
			                                       .completionPercentage(completion)
			                                       .totalTrees(totalTrees != null ? totalTrees : 0L)
			                                       .totalCreditsIssued(totalCredits != null ? totalCredits : 0L)
			                                       .build();
		               })
		               .collect(Collectors.toList());
	}

	@Override
	public DashboardSummaryResponse getDashboardSummaryByProject(Integer projectId) {
		// Implementation for project-specific dashboard
		// Similar to getDashboardSummary but filtered by projectId
		return getDashboardSummary(); // Simplified for now
	}

	private List<RecentActivityResponse> getRecentActivities(int limit) {
		List<RecentActivityResponse> activities = new ArrayList<>();

		// Get recent contracts
		List<Contract> recentContracts = contractRepository.findRecentContracts(limit);
		for (Contract c : recentContracts) {
			activities.add(RecentActivityResponse.builder()
			                                     .activityType("CONTRACT")
			                                     .description("Hợp đồng " + c. getContractCode() + " - " + c.getContractStatus())
			                                     .referenceCode(c.getContractCode())
			                                     .referenceId(c.getId())
			                                     .timestamp(c.getCreatedAt())
			                                     .build());
		}

		// Get recent transactions
		List<CreditTransaction> recentTxns = transactionRepository.findRecentTransactions(limit);
		for (CreditTransaction t : recentTxns) {
			activities.add(RecentActivityResponse.builder()
			                                     .activityType("TRANSACTION")
			                                     .description("Giao dịch " + t. getTransactionCode() + " - " + t.getQuantity() + " tín chỉ")
			                                     .referenceCode(t.getTransactionCode())
			                                     .referenceId(t.getId())
			                                     .timestamp(t.getCreatedAt())
			                                     .build());
		}

		// Get recent credits issued
		List<CarbonCredit> recentCredits = creditRepository.findRecentCredits(limit);
		for (CarbonCredit c : recentCredits) {
			activities.add(RecentActivityResponse.builder()
			                                     .activityType("CREDIT_ISSUED")
			                                     .description("Phát hành " + c.getCreditsIssued() + " tín chỉ - " + c.getCreditCode())
			                                     .referenceCode(c.getCreditCode())
			                                     .referenceId(c.getId())
			                                     .timestamp(c.getCreatedAt())
			                                     .build());
		}

		// Sort by timestamp desc and limit
		return activities.stream()
		                 .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
		                 .limit(limit)
		                 .collect(Collectors.toList());
	}
}
