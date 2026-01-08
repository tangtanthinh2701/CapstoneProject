package com.capston.project.back.end.service;

import com.capston.project.back.end.response.dashboard.Co2ReportResponse;
import com.capston.project.back.end.response.dashboard.CreditReportResponse;
import com.capston.project.back.end.response.dashboard.ReportFilterRequest;
import com.capston.project.back.end.response.dashboard.RevenueReportResponse;

public interface ReportService {
	// CO2 Reports
	Co2ReportResponse getCo2Report(ReportFilterRequest filter);
	Co2ReportResponse getCo2ReportByProject(Integer projectId, ReportFilterRequest filter);
	Co2ReportResponse getCo2ReportByFarm(Integer farmId, ReportFilterRequest filter);

	// Revenue Reports
	RevenueReportResponse getRevenueReport(ReportFilterRequest filter);
	RevenueReportResponse getRevenueReportByProject(Integer projectId, ReportFilterRequest filter);

	// Credit Reports
	CreditReportResponse getCreditReport(ReportFilterRequest filter);
	CreditReportResponse getCreditReportByProject(Integer projectId, ReportFilterRequest filter);
}
