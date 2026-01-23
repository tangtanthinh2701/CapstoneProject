package com.capston.project.back.end.controller;

import com.capston.project.back.end.response.dashboard.DashboardSummaryResponse;
import com.capston.project.back.end.response.dashboard.MonthlyDataResponse;
import com.capston.project.back.end.response.dashboard.ProjectCarbonData;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.DashboardService;
import com.capston.project.back.end.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

	private final DashboardService dashboardService;
	private final UserService userService;

	// ==================== ADMIN DASHBOARD ====================

	@GetMapping("/admin/summary")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getAdminDashboardSummary() {
		DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
		return ResponseEntity.ok(ApiResponse.success("Admin dashboard summary retrieved", summary));
	}

	@GetMapping("/admin/co2-monthly")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<List<MonthlyDataResponse>>> getAdminMonthlyCo2Data(@RequestParam(required = false) Integer year) {
		int targetYear = year != null ? year : LocalDate.now().getYear();
		List<MonthlyDataResponse> data = dashboardService.getMonthlyCo2Data(targetYear);
		return ResponseEntity.ok(ApiResponse.success(data));
	}

	@GetMapping("/admin/revenue-monthly")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<List<MonthlyDataResponse>>> getAdminMonthlyRevenueData(@RequestParam(required = false) Integer year) {
		int targetYear = year != null ? year : LocalDate.now().getYear();
		List<MonthlyDataResponse> data = dashboardService.getMonthlyRevenueData(targetYear);
		return ResponseEntity.ok(ApiResponse.success(data));
	}

	@GetMapping("/admin/top-projects")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<List<ProjectCarbonData>>> getAdminTopProjectsByCo2(@RequestParam(defaultValue = "10") int limit) {
		List<ProjectCarbonData> data = dashboardService.getTopProjectsByCo2(limit);
		return ResponseEntity.ok(ApiResponse.success(data));
	}

	// ==================== USER DASHBOARD (Personal Statistics) ====================

	@GetMapping("/my-dashboard")
	public ResponseEntity<ApiResponse<Map<String, Object>>> getMyDashboard(Authentication authentication) {
		String username = authentication.getName();
		Map<String, Object> dashboard = userService.getUserDashboard(username);
		return ResponseEntity.ok(ApiResponse.success("Personal dashboard retrieved", dashboard));
	}

	// ==================== PUBLIC DASHBOARD (for all authenticated users) ====================

	@GetMapping("/summary")
	public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
		DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
		return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved", summary));
	}

	@GetMapping("/co2-monthly")
	public ResponseEntity<ApiResponse<List<MonthlyDataResponse>>> getMonthlyCo2Data(@RequestParam(required = false) Integer year) {
		int targetYear = year != null ? year :  LocalDate.now().getYear();
		List<MonthlyDataResponse> data = dashboardService. getMonthlyCo2Data(targetYear);
		return ResponseEntity.ok(ApiResponse.success(data));
	}

	@GetMapping("/revenue-monthly")
	public ResponseEntity<ApiResponse<List<MonthlyDataResponse>>> getMonthlyRevenueData(@RequestParam(required = false) Integer year) {
		int targetYear = year != null ? year : LocalDate.now().getYear();
		List<MonthlyDataResponse> data = dashboardService.getMonthlyRevenueData(targetYear);
		return ResponseEntity. ok(ApiResponse.success(data));
	}

	@GetMapping("/top-projects")
	public ResponseEntity<ApiResponse<List<ProjectCarbonData>>> getTopProjectsByCo2(@RequestParam(defaultValue = "10") int limit) {
		List<ProjectCarbonData> data = dashboardService.getTopProjectsByCo2(limit);
		return ResponseEntity.ok(ApiResponse.success(data));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardByProject(@PathVariable Integer projectId) {
		DashboardSummaryResponse summary = dashboardService.getDashboardSummaryByProject(projectId);
		return ResponseEntity.ok(ApiResponse.success(summary));
	}
}
