package com.capston.project.back.end.controller;

import com.capston.project.back.end.response.dashboard.Co2ReportResponse;
import com.capston.project.back.end.response.dashboard.CreditReportResponse;
import com.capston.project.back.end.response.dashboard.ReportFilterRequest;
import com.capston.project.back.end.response.dashboard.RevenueReportResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.ExportService;
import com.capston.project.back.end.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

	private final ReportService reportService;
	private final ExportService exportService;

	// ==================== CO2 REPORTS ====================

	@GetMapping("/co2")
	public ResponseEntity<ApiResponse<Co2ReportResponse>> getCo2Report(@ModelAttribute ReportFilterRequest filter) {
		Co2ReportResponse report = reportService.getCo2Report(filter);
		return ResponseEntity.ok(ApiResponse.success("CO2 report generated", report));
	}

	@GetMapping("/co2/project/{projectId}")
	public ResponseEntity<ApiResponse<Co2ReportResponse>> getCo2ReportByProject(@PathVariable Integer projectId,
			@ModelAttribute ReportFilterRequest filter) {
		Co2ReportResponse report = reportService.getCo2ReportByProject(projectId, filter);
		return ResponseEntity.ok(ApiResponse.success(report));
	}

	@GetMapping("/co2/farm/{farmId}")
	public ResponseEntity<ApiResponse<Co2ReportResponse>> getCo2ReportByFarm(@PathVariable Integer farmId,
			@ModelAttribute ReportFilterRequest filter) {
		Co2ReportResponse report = reportService.getCo2ReportByFarm(farmId, filter);
		return ResponseEntity.ok(ApiResponse.success(report));
	}

	// ==================== REVENUE REPORTS ====================

	@GetMapping("/revenue")
	public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport(
			@ModelAttribute ReportFilterRequest filter) {
		RevenueReportResponse report = reportService.getRevenueReport(filter);
		return ResponseEntity.ok(ApiResponse.success("Revenue report generated", report));
	}

	@GetMapping("/revenue/project/{projectId}")
	public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReportByProject(@PathVariable Integer projectId,
			@ModelAttribute ReportFilterRequest filter) {
		RevenueReportResponse report = reportService.getRevenueReportByProject(projectId, filter);
		return ResponseEntity.ok(ApiResponse.success(report));
	}

	// ==================== CREDIT REPORTS ====================

	@GetMapping("/credits")
	public ResponseEntity<ApiResponse<CreditReportResponse>> getCreditReport(
			@ModelAttribute ReportFilterRequest filter) {
		CreditReportResponse report = reportService.getCreditReport(filter);
		return ResponseEntity.ok(ApiResponse.success("Credit report generated", report));
	}

	@GetMapping("/credits/project/{projectId}")
	public ResponseEntity<ApiResponse<CreditReportResponse>> getCreditReportByProject(@PathVariable Integer projectId,
			@ModelAttribute ReportFilterRequest filter) {
		CreditReportResponse report = reportService.getCreditReportByProject(projectId, filter);
		return ResponseEntity.ok(ApiResponse.success(report));
	}

	// ==================== EXCEL EXPORTS ====================

	@GetMapping("/co2/export/excel")
	public ResponseEntity<byte[]> exportCo2ReportToExcel(@ModelAttribute ReportFilterRequest filter) {
		byte[] excelContent = exportService.exportCo2ReportToExcel(filter);
		String filename = "CO2_Report_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
				.contentType(
						MediaType.parseMediaType("application/vnd. openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(excelContent);
	}

	@GetMapping("/revenue/export/excel")
	public ResponseEntity<byte[]> exportRevenueReportToExcel(@ModelAttribute ReportFilterRequest filter) {
		byte[] excelContent = exportService.exportRevenueReportToExcel(filter);
		String filename = "Revenue_Report_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
				.contentType(
						MediaType.parseMediaType("application/vnd. openxmlformats-officedocument.spreadsheetml. sheet"))
				.body(excelContent);
	}

	@GetMapping("/credits/export/excel")
	public ResponseEntity<byte[]> exportCreditReportToExcel(@ModelAttribute ReportFilterRequest filter) {
		byte[] excelContent = exportService.exportCreditReportToExcel(filter);
		String filename = "Credit_Report_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
				.contentType(
						MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(excelContent);
	}

	// ==================== PDF EXPORTS ====================

	@GetMapping("/co2/export/pdf")
	public ResponseEntity<byte[]> exportCo2ReportToPdf(@ModelAttribute ReportFilterRequest filter) {
		byte[] pdfContent = exportService.exportCo2ReportToPdf(filter);
		String filename = "CO2_Report_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".pdf";

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdfContent);
	}

	@GetMapping("/revenue/export/pdf")
	public ResponseEntity<byte[]> exportRevenueReportToPdf(@ModelAttribute ReportFilterRequest filter) {
		byte[] pdfContent = exportService.exportRevenueReportToPdf(filter);
		String filename = "Revenue_Report_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".pdf";

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdfContent);
	}

	@GetMapping("/credits/export/pdf")
	public ResponseEntity<byte[]> exportCreditReportToPdf(@ModelAttribute ReportFilterRequest filter) {
		byte[] pdfContent = exportService.exportCreditReportToPdf(filter);
		String filename = "Credit_Report_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".pdf";

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdfContent);
	}
}
