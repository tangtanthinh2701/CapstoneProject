package com.capston.project.back.end.service;

import com.capston.project.back.end.response.dashboard.ReportFilterRequest;

public interface ExportService {
	// Excel exports
	byte[] exportCo2ReportToExcel(ReportFilterRequest filter);
	byte[] exportRevenueReportToExcel(ReportFilterRequest filter);
	byte[] exportCreditReportToExcel(ReportFilterRequest filter);
	byte[] exportProjectsToExcel();
	byte[] exportFarmsToExcel();

	// PDF exports
	byte[] exportCo2ReportToPdf(ReportFilterRequest filter);
	byte[] exportRevenueReportToPdf(ReportFilterRequest filter);
	byte[] exportCreditReportToPdf(ReportFilterRequest filter);
}
