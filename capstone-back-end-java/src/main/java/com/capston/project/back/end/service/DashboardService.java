package com.capston.project.back.end.service;

import com.capston.project.back.end.response.dashboard.DashboardSummaryResponse;
import com.capston.project.back.end.response.dashboard.MonthlyDataResponse;
import com.capston.project.back.end.response.dashboard.ProjectCarbonData;

import java.util.List;

public interface DashboardService {
	DashboardSummaryResponse getDashboardSummary();

	List<MonthlyDataResponse> getMonthlyCo2Data(Integer year);

	List<MonthlyDataResponse> getMonthlyRevenueData(Integer year);

	List<ProjectCarbonData> getTopProjectsByCo2(int limit);

	DashboardSummaryResponse getDashboardSummaryByProject(Integer projectId);
}
