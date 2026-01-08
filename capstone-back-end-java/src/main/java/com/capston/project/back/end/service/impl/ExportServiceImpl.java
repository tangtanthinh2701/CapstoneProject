package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.response.dashboard.Co2ReportResponse;
import com.capston.project.back.end.response.dashboard.CreditReportResponse;
import com.capston.project.back.end.response.dashboard.ReportFilterRequest;
import com.capston.project.back.end.response.dashboard.RevenueReportResponse;
import com.capston.project.back.end.service.ExportService;
import com.capston.project.back.end.service.ReportService;
import com.lowagie.text.*;
import com.lowagie. text.Font;
import com. lowagie.text.pdf. PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j. Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache. poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt. Color;
import java.io. ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java. time.format.DateTimeFormatter;
import java.util. List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportServiceImpl implements ExportService {

	private final ReportService reportService;

	// ==================== EXCEL EXPORTS ====================

	@Override
	public byte[] exportCo2ReportToExcel(ReportFilterRequest filter) {
		log.info("Exporting CO2 report to Excel");

		Co2ReportResponse report = reportService.getCo2Report(filter);

		try (Workbook workbook = new XSSFWorkbook();
		     ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			// Create styles
			CellStyle headerStyle = createHeaderStyle(workbook);
			CellStyle dataStyle = createDataStyle(workbook);
			CellStyle numberStyle = createNumberStyle(workbook);
			CellStyle titleStyle = createTitleStyle(workbook);

			// Summary Sheet
			Sheet summarySheet = workbook.createSheet("Tổng quan");
			createCo2SummarySheet(summarySheet, report, titleStyle, headerStyle, dataStyle, numberStyle);

			// Project Details Sheet
			Sheet projectSheet = workbook.createSheet("Theo dự án");
			createCo2ProjectSheet(projectSheet, report. getProjectDetails(), headerStyle, dataStyle, numberStyle);

			// Farm Details Sheet
			Sheet farmSheet = workbook.createSheet("Theo Farm");
			createCo2FarmSheet(farmSheet, report. getFarmDetails(), headerStyle, dataStyle, numberStyle);

			// Species Details Sheet
			Sheet speciesSheet = workbook.createSheet("Theo loại cây");
			createCo2SpeciesSheet(speciesSheet, report.getSpeciesDetails(), headerStyle, dataStyle, numberStyle);

			workbook.write(out);
			return out.toByteArray();

		} catch (Exception e) {
			log.error("Error exporting CO2 report to Excel:  {}", e.getMessage(), e);
			throw new RuntimeException("Failed to export CO2 report to Excel", e);
		}
	}

	@Override
	public byte[] exportRevenueReportToExcel(ReportFilterRequest filter) {
		log.info("Exporting Revenue report to Excel");

		RevenueReportResponse report = reportService.getRevenueReport(filter);

		try (Workbook workbook = new XSSFWorkbook();
		     ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			CellStyle headerStyle = createHeaderStyle(workbook);
			CellStyle dataStyle = createDataStyle(workbook);
			CellStyle numberStyle = createNumberStyle(workbook);
			CellStyle currencyStyle = createCurrencyStyle(workbook);
			CellStyle titleStyle = createTitleStyle(workbook);

			// Summary Sheet
			Sheet summarySheet = workbook.createSheet("Tổng quan");
			createRevenueSummarySheet(summarySheet, report, titleStyle, headerStyle, dataStyle, currencyStyle);

			// Project Details Sheet
			Sheet projectSheet = workbook.createSheet("Theo dự án");
			createRevenueProjectSheet(projectSheet, report.getProjectDetails(), headerStyle, dataStyle, currencyStyle);

			// Monthly Details Sheet
			Sheet monthlySheet = workbook.createSheet("Theo tháng");
			createRevenueMonthlySheet(monthlySheet, report.getMonthlyDetails(), headerStyle, dataStyle, currencyStyle);

			workbook.write(out);
			return out.toByteArray();

		} catch (Exception e) {
			log.error("Error exporting Revenue report to Excel: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to export Revenue report to Excel", e);
		}
	}

	@Override
	public byte[] exportCreditReportToExcel(ReportFilterRequest filter) {
		log.info("Exporting Credit report to Excel");

		CreditReportResponse report = reportService. getCreditReport(filter);

		try (Workbook workbook = new XSSFWorkbook();
		     ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			CellStyle headerStyle = createHeaderStyle(workbook);
			CellStyle dataStyle = createDataStyle(workbook);
			CellStyle numberStyle = createNumberStyle(workbook);
			CellStyle currencyStyle = createCurrencyStyle(workbook);
			CellStyle titleStyle = createTitleStyle(workbook);

			// Summary Sheet
			Sheet summarySheet = workbook.createSheet("Tổng quan");
			createCreditSummarySheet(summarySheet, report, titleStyle, headerStyle, dataStyle, numberStyle, currencyStyle);

			// Yearly Details Sheet
			Sheet yearlySheet = workbook.createSheet("Theo năm");
			createCreditYearlySheet(yearlySheet, report.getYearlyDetails(), headerStyle, dataStyle, numberStyle, currencyStyle);

			// Project Details Sheet
			Sheet projectSheet = workbook.createSheet("Theo dự án");
			createCreditProjectSheet(projectSheet, report.getProjectDetails(), headerStyle, dataStyle, numberStyle, currencyStyle);

			workbook.write(out);
			return out.toByteArray();

		} catch (Exception e) {
			log.error("Error exporting Credit report to Excel: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to export Credit report to Excel", e);
		}
	}

	@Override
	public byte[] exportProjectsToExcel() {
		// Implementation for exporting projects list
		return new byte[0];
	}

	@Override
	public byte[] exportFarmsToExcel() {
		// Implementation for exporting farms list
		return new byte[0];
	}

	// ==================== PDF EXPORTS ====================

	@Override
	public byte[] exportCo2ReportToPdf(ReportFilterRequest filter) {
		log.info("Exporting CO2 report to PDF");

		Co2ReportResponse report = reportService.getCo2Report(filter);

		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.A4);
			PdfWriter. getInstance(document, out);

			document.open();

			// Title
			Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.DARK_GRAY);
			Paragraph title = new Paragraph(report.getReportTitle(), titleFont);
			title.setAlignment(Element. ALIGN_CENTER);
			title.setSpacingAfter(20);
			document. add(title);

			// Report date
			Font dateFont = new Font(Font. HELVETICA, 10, Font.NORMAL, Color. GRAY);
			Paragraph date = new Paragraph("Ngày báo cáo: " +
			                               report.getReportDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), dateFont);
			date.setAlignment(Element.ALIGN_CENTER);
			date.setSpacingAfter(20);
			document.add(date);

			// Summary section
			Font sectionFont = new Font(Font. HELVETICA, 14, Font.BOLD, Color. DARK_GRAY);
			Paragraph summaryTitle = new Paragraph("TỔNG QUAN", sectionFont);
			summaryTitle.setSpacingBefore(10);
			summaryTitle.setSpacingAfter(10);
			document.add(summaryTitle);

			// Summary table
			PdfPTable summaryTable = new PdfPTable(2);
			summaryTable.setWidthPercentage(100);
			addSummaryRow(summaryTable, "Tổng CO2 hấp thụ (kg):", formatNumber(report.getTotalCo2AbsorbedKg()));
			addSummaryRow(summaryTable, "Tổng CO2 hấp thụ (tấn):", formatNumber(report. getTotalCo2AbsorbedTons()));
			addSummaryRow(summaryTable, "Mục tiêu CO2 (kg):", formatNumber(report. getTargetCo2Kg()));
			addSummaryRow(summaryTable, "Tỷ lệ hoàn thành:", formatNumber(report.getCompletionPercentage()) + "%");
			document.add(summaryTable);

			// Project details section
			Paragraph projectTitle = new Paragraph("THEO DỰ ÁN", sectionFont);
			projectTitle. setSpacingBefore(20);
			projectTitle.setSpacingAfter(10);
			document.add(projectTitle);

			PdfPTable projectTable = new PdfPTable(5);
			projectTable.setWidthPercentage(100);
			projectTable.setWidths(new float[]{2f, 3f, 2f, 2f, 1.5f});

			// Header
			addTableHeader(projectTable, "Mã dự án", "Tên dự án", "CO2 hấp thụ (kg)", "Mục tiêu (kg)", "Tỷ lệ (%)");

			// Data
			for (Co2ReportResponse.ProjectCo2Detail p : report.getProjectDetails()) {
				addTableCell(projectTable, p.getProjectCode());
				addTableCell(projectTable, p.getProjectName());
				addTableCell(projectTable, formatNumber(p.getCo2Absorbed()));
				addTableCell(projectTable, formatNumber(p.getTargetCo2()));
				addTableCell(projectTable, formatNumber(p.getPercentage()));
			}
			document.add(projectTable);

			document.close();
			return out. toByteArray();

		} catch (Exception e) {
			log.error("Error exporting CO2 report to PDF: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to export CO2 report to PDF", e);
		}
	}

	@Override
	public byte[] exportRevenueReportToPdf(ReportFilterRequest filter) {
		log.info("Exporting Revenue report to PDF");

		RevenueReportResponse report = reportService.getRevenueReport(filter);

		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.A4);
			PdfWriter. getInstance(document, out);

			document.open();

			// Title
			Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.DARK_GRAY);
			Paragraph title = new Paragraph(report.getReportTitle(), titleFont);
			title.setAlignment(Element.ALIGN_CENTER);
			title.setSpacingAfter(20);
			document.add(title);

			// Report date
			Font dateFont = new Font(Font.HELVETICA, 10, Font. NORMAL, Color.GRAY);
			Paragraph date = new Paragraph("Ngày báo cáo: " +
			                               report.getReportDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), dateFont);
			date.setAlignment(Element.ALIGN_CENTER);
			date.setSpacingAfter(20);
			document.add(date);

			// Summary section
			Font sectionFont = new Font(Font.HELVETICA, 14, Font. BOLD, Color.DARK_GRAY);
			Paragraph summaryTitle = new Paragraph("TỔNG QUAN DOANH THU", sectionFont);
			summaryTitle.setSpacingBefore(10);
			summaryTitle.setSpacingAfter(10);
			document. add(summaryTitle);

			// Summary table
			PdfPTable summaryTable = new PdfPTable(2);
			summaryTable.setWidthPercentage(100);
			addSummaryRow(summaryTable, "Tổng doanh thu:", formatCurrency(report.getTotalRevenue()));
			addSummaryRow(summaryTable, "Doanh thu tín chỉ:", formatCurrency(report.getCreditSalesRevenue()));
			addSummaryRow(summaryTable, "Doanh thu hợp đồng:", formatCurrency(report.getContractRevenue()));
			addSummaryRow(summaryTable, "Tổng giao dịch:", String.valueOf(report.getTotalTransactions()));
			document.add(summaryTable);

			// Project details section
			Paragraph projectTitle = new Paragraph("DOANH THU THEO DỰ ÁN", sectionFont);
			projectTitle.setSpacingBefore(20);
			projectTitle.setSpacingAfter(10);
			document.add(projectTitle);

			PdfPTable projectTable = new PdfPTable(5);
			projectTable.setWidthPercentage(100);
			projectTable.setWidths(new float[]{1.5f, 2.5f, 2f, 2f, 2f});

			addTableHeader(projectTable, "Mã DA", "Tên dự án", "DT Tín chỉ", "DT Hợp đồng", "Tổng DT");

			for (RevenueReportResponse.ProjectRevenueDetail p : report.getProjectDetails()) {
				addTableCell(projectTable, p.getProjectCode());
				addTableCell(projectTable, p.getProjectName());
				addTableCell(projectTable, formatCurrency(p.getCreditRevenue()));
				addTableCell(projectTable, formatCurrency(p.getContractRevenue()));
				addTableCell(projectTable, formatCurrency(p.getTotalRevenue()));
			}
			document.add(projectTable);

			document.close();
			return out.toByteArray();

		} catch (Exception e) {
			log.error("Error exporting Revenue report to PDF: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to export Revenue report to PDF", e);
		}
	}

	@Override
	public byte[] exportCreditReportToPdf(ReportFilterRequest filter) {
		log.info("Exporting Credit report to PDF");

		CreditReportResponse report = reportService.getCreditReport(filter);

		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Document document = new Document(PageSize.A4);
			PdfWriter.getInstance(document, out);

			document. open();

			// Title
			Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color. DARK_GRAY);
			Paragraph title = new Paragraph(report.getReportTitle(), titleFont);
			title.setAlignment(Element.ALIGN_CENTER);
			title.setSpacingAfter(20);
			document. add(title);

			// Report date
			Font dateFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.GRAY);
			Paragraph date = new Paragraph("Ngày báo cáo:  " +
			                               report. getReportDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), dateFont);
			date.setAlignment(Element.ALIGN_CENTER);
			date.setSpacingAfter(20);
			document.add(date);

			// Summary section
			Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.DARK_GRAY);
			Paragraph summaryTitle = new Paragraph("TỔNG QUAN TÍN CHỈ CARBON", sectionFont);
			summaryTitle.setSpacingBefore(10);
			summaryTitle.setSpacingAfter(10);
			document.add(summaryTitle);

			// Summary table
			PdfPTable summaryTable = new PdfPTable(2);
			summaryTable.setWidthPercentage(100);
			addSummaryRow(summaryTable, "Tổng tín chỉ phát hành:", String.valueOf(report.getTotalCreditsIssued()));
			addSummaryRow(summaryTable, "Tín chỉ đã bán:", String.valueOf(report. getTotalCreditsSold()));
			addSummaryRow(summaryTable, "Tín chỉ đã retire:", String.valueOf(report.getTotalCreditsRetired()));
			addSummaryRow(summaryTable, "Tín chỉ còn lại:", String.valueOf(report.getTotalCreditsAvailable()));
			addSummaryRow(summaryTable, "Tổng CO2 (tấn):", formatNumber(report.getTotalCo2Tons()));
			addSummaryRow(summaryTable, "Tổng doanh thu:", formatCurrency(report.getTotalRevenue()));
			addSummaryRow(summaryTable, "Giá TB/tín chỉ:", formatCurrency(report.getAveragePrice()));
			document.add(summaryTable);

			// Yearly details section
			Paragraph yearlyTitle = new Paragraph("THEO NĂM", sectionFont);
			yearlyTitle.setSpacingBefore(20);
			yearlyTitle.setSpacingAfter(10);
			document.add(yearlyTitle);

			PdfPTable yearlyTable = new PdfPTable(6);
			yearlyTable.setWidthPercentage(100);
			yearlyTable.setWidths(new float[]{1f, 1.5f, 1.5f, 1.5f, 1.5f, 2f});

			addTableHeader(yearlyTable, "Năm", "Phát hành", "Đã bán", "Retire", "Còn lại", "Doanh thu");

			for (CreditReportResponse.YearlyCreditDetail y : report. getYearlyDetails()) {
				addTableCell(yearlyTable, String.valueOf(y.getYear()));
				addTableCell(yearlyTable, String.valueOf(y.getCreditsIssued()));
				addTableCell(yearlyTable, String. valueOf(y.getCreditsSold()));
				addTableCell(yearlyTable, String.valueOf(y.getCreditsRetired()));
				addTableCell(yearlyTable, String.valueOf(y.getCreditsAvailable()));
				addTableCell(yearlyTable, formatCurrency(y.getRevenue()));
			}
			document.add(yearlyTable);

			document.close();
			return out.toByteArray();

		} catch (Exception e) {
			log.error("Error exporting Credit report to PDF: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to export Credit report to PDF", e);
		}
	}

	// ==================== EXCEL HELPER METHODS ====================

	private CellStyle createHeaderStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		org.apache.poi.ss.usermodel.Font font = workbook.createFont();
		font.setBold(true);
		font.setColor(IndexedColors.WHITE. getIndex());
		style.setFont(font);
		style.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
		style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		style.setAlignment(HorizontalAlignment. CENTER);
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle. THIN);
		return style;
	}

	private CellStyle createDataStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle. THIN);
		return style;
	}

	private CellStyle createNumberStyle(Workbook workbook) {
		CellStyle style = createDataStyle(workbook);
		DataFormat format = workbook.createDataFormat();
		style.setDataFormat(format.getFormat("#,##0.00"));
		style.setAlignment(HorizontalAlignment.RIGHT);
		return style;
	}

	private CellStyle createCurrencyStyle(Workbook workbook) {
		CellStyle style = createDataStyle(workbook);
		DataFormat format = workbook.createDataFormat();
		style.setDataFormat(format.getFormat("#,##0 VND"));
		style.setAlignment(HorizontalAlignment.RIGHT);
		return style;
	}

	private CellStyle createTitleStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		org.apache.poi.ss.usermodel.Font font = workbook. createFont();
		font.setBold(true);
		font.setFontHeightInPoints((short) 16);
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		return style;
	}

	private void createCo2SummarySheet(Sheet sheet, Co2ReportResponse report,
	                                   CellStyle titleStyle, CellStyle headerStyle,
	                                   CellStyle dataStyle, CellStyle numberStyle) {
		int rowNum = 0;

		// Title
		Row titleRow = sheet.createRow(rowNum++);
		Cell titleCell = titleRow.createCell(0);
		titleCell.setCellValue(report.getReportTitle());
		titleCell.setCellStyle(titleStyle);
		sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));

		rowNum++; // Empty row

		// Report date
		Row dateRow = sheet.createRow(rowNum++);
		dateRow.createCell(0).setCellValue("Ngày báo cáo:");
		dateRow.createCell(1).setCellValue(report. getReportDate().toString());

		rowNum++; // Empty row

		// Summary
		String[][] summaryData = {
				{"Tổng CO2 hấp thụ (kg)", report.getTotalCo2AbsorbedKg().toString()},
				{"Tổng CO2 hấp thụ (tấn)", report.getTotalCo2AbsorbedTons().toString()},
				{"Mục tiêu CO2 (kg)", report.getTargetCo2Kg().toString()},
				{"Tỷ lệ hoàn thành (%)", report.getCompletionPercentage().toString()}
		};

		for (String[] data : summaryData) {
			Row row = sheet.createRow(rowNum++);
			Cell labelCell = row.createCell(0);
			labelCell.setCellValue(data[0]);
			labelCell.setCellStyle(dataStyle);

			Cell valueCell = row.createCell(1);
			valueCell.setCellValue(Double.parseDouble(data[1]));
			valueCell.setCellStyle(numberStyle);
		}

		// Auto-size columns
		for (int i = 0; i < 4; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createCo2ProjectSheet(Sheet sheet, List<Co2ReportResponse.ProjectCo2Detail> projects,
	                                   CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle) {
		int rowNum = 0;

		// Headers
		Row headerRow = sheet. createRow(rowNum++);
		String[] headers = {"Mã dự án", "Tên dự án", "CO2 hấp thụ (kg)", "Mục tiêu (kg)", "Tỷ lệ (%)", "Số cây", "Số farm"};
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		// Data
		for (Co2ReportResponse.ProjectCo2Detail p : projects) {
			Row row = sheet.createRow(rowNum++);

			Cell codeCell = row.createCell(0);
			codeCell. setCellValue(p.getProjectCode());
			codeCell.setCellStyle(dataStyle);

			Cell nameCell = row.createCell(1);
			nameCell.setCellValue(p.getProjectName());
			nameCell.setCellStyle(dataStyle);

			Cell co2Cell = row.createCell(2);
			co2Cell.setCellValue(p.getCo2Absorbed().doubleValue());
			co2Cell.setCellStyle(numberStyle);

			Cell targetCell = row.createCell(3);
			targetCell.setCellValue(p.getTargetCo2().doubleValue());
			targetCell.setCellStyle(numberStyle);

			Cell pctCell = row.createCell(4);
			pctCell. setCellValue(p.getPercentage().doubleValue());
			pctCell.setCellStyle(numberStyle);

			Cell treesCell = row.createCell(5);
			treesCell.setCellValue(p.getTotalTrees());
			treesCell.setCellStyle(dataStyle);

			Cell farmsCell = row.createCell(6);
			farmsCell. setCellValue(p.getTotalFarms());
			farmsCell.setCellStyle(dataStyle);
		}

		// Auto-size columns
		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createCo2FarmSheet(Sheet sheet, List<Co2ReportResponse.FarmCo2Detail> farms,
	                                CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle) {
		int rowNum = 0;

		Row headerRow = sheet.createRow(rowNum++);
		String[] headers = {"Mã farm", "Tên farm", "Địa điểm", "CO2 hấp thụ (kg)", "Tổng cây", "Cây sống", "Diện tích (m²)"};
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		for (Co2ReportResponse.FarmCo2Detail f : farms) {
			Row row = sheet.createRow(rowNum++);
			row.createCell(0).setCellValue(f.getFarmCode());
			row.createCell(1).setCellValue(f.getFarmName());
			row.createCell(2).setCellValue(f.getLocation() != null ? f.getLocation() : "");

			Cell co2Cell = row.createCell(3);
			co2Cell.setCellValue(f.getCo2Absorbed().doubleValue());
			co2Cell.setCellStyle(numberStyle);

			row.createCell(4).setCellValue(f.getTotalTrees());
			row.createCell(5).setCellValue(f.getAliveTrees());

			Cell areaCell = row.createCell(6);
			areaCell. setCellValue(f.getArea() != null ? f.getArea().doubleValue() : 0);
			areaCell.setCellStyle(numberStyle);
		}

		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createCo2SpeciesSheet(Sheet sheet, List<Co2ReportResponse.SpeciesCo2Detail> species,
	                                   CellStyle headerStyle, CellStyle dataStyle, CellStyle numberStyle) {
		int rowNum = 0;

		Row headerRow = sheet.createRow(rowNum++);
		String[] headers = {"Tên loại cây", "Tên khoa học", "Hệ số hấp thụ", "Tổng cây", "CO2 hấp thụ (kg)", "Tỷ lệ (%)"};
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		for (Co2ReportResponse.SpeciesCo2Detail s : species) {
			Row row = sheet. createRow(rowNum++);
			row.createCell(0).setCellValue(s.getSpeciesName());
			row.createCell(1).setCellValue(s.getScientificName() != null ? s.getScientificName() : "");

			Cell rateCell = row.createCell(2);
			rateCell. setCellValue(s.getCarbonAbsorptionRate().doubleValue());
			rateCell.setCellStyle(numberStyle);

			row. createCell(3).setCellValue(s.getTotalTrees());

			Cell co2Cell = row. createCell(4);
			co2Cell.setCellValue(s.getTotalCo2Absorbed().doubleValue());
			co2Cell.setCellStyle(numberStyle);

			Cell pctCell = row.createCell(5);
			pctCell. setCellValue(s.getPercentage().doubleValue());
			pctCell.setCellStyle(numberStyle);
		}

		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createRevenueSummarySheet(Sheet sheet, RevenueReportResponse report,
	                                       CellStyle titleStyle, CellStyle headerStyle,
	                                       CellStyle dataStyle, CellStyle currencyStyle) {
		// Similar implementation as createCo2SummarySheet
		int rowNum = 0;

		Row titleRow = sheet. createRow(rowNum++);
		Cell titleCell = titleRow.createCell(0);
		titleCell. setCellValue(report.getReportTitle());
		titleCell. setCellStyle(titleStyle);
		sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));

		rowNum++;

		Row dateRow = sheet.createRow(rowNum++);
		dateRow.createCell(0).setCellValue("Ngày báo cáo:");
		dateRow.createCell(1).setCellValue(report.getReportDate().toString());

		rowNum++;

		// Summary data
		createSummaryRow(sheet, rowNum++, "Tổng doanh thu:", report.getTotalRevenue(), dataStyle, currencyStyle);
		createSummaryRow(sheet, rowNum++, "Doanh thu tín chỉ:", report. getCreditSalesRevenue(), dataStyle, currencyStyle);
		createSummaryRow(sheet, rowNum++, "Doanh thu hợp đồng:", report.getContractRevenue(), dataStyle, currencyStyle);

		for (int i = 0; i < 4; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createRevenueProjectSheet(Sheet sheet, List<RevenueReportResponse.ProjectRevenueDetail> projects,
	                                       CellStyle headerStyle, CellStyle dataStyle, CellStyle currencyStyle) {
		int rowNum = 0;

		Row headerRow = sheet.createRow(rowNum++);
		String[] headers = {"Mã dự án", "Tên dự án", "DT Tín chỉ", "DT Hợp đồng", "Tổng DT", "Tín chỉ bán", "Số GD"};
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		for (RevenueReportResponse.ProjectRevenueDetail p : projects) {
			Row row = sheet.createRow(rowNum++);
			row.createCell(0).setCellValue(p.getProjectCode());
			row.createCell(1).setCellValue(p.getProjectName());

			Cell creditCell = row.createCell(2);
			creditCell.setCellValue(p.getCreditRevenue().doubleValue());
			creditCell.setCellStyle(currencyStyle);

			Cell contractCell = row.createCell(3);
			contractCell.setCellValue(p.getContractRevenue().doubleValue());
			contractCell.setCellStyle(currencyStyle);

			Cell totalCell = row.createCell(4);
			totalCell. setCellValue(p.getTotalRevenue().doubleValue());
			totalCell.setCellStyle(currencyStyle);

			row.createCell(5).setCellValue(p.getCreditsSold());
			row.createCell(6).setCellValue(p.getTransactionCount());
		}

		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createRevenueMonthlySheet(Sheet sheet, List<RevenueReportResponse.MonthlyRevenueDetail> monthly,
	                                       CellStyle headerStyle, CellStyle dataStyle, CellStyle currencyStyle) {
		int rowNum = 0;

		Row headerRow = sheet.createRow(rowNum++);
		String[] headers = {"Năm", "Tháng", "DT Tín chỉ", "DT Hợp đồng", "Tổng DT", "Số GD"};
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		for (RevenueReportResponse.MonthlyRevenueDetail m : monthly) {
			Row row = sheet.createRow(rowNum++);
			row.createCell(0).setCellValue(m.getYear());
			row.createCell(1).setCellValue(m.getMonthName());

			Cell creditCell = row.createCell(2);
			creditCell.setCellValue(m.getCreditRevenue().doubleValue());
			creditCell.setCellStyle(currencyStyle);

			Cell contractCell = row.createCell(3);
			contractCell.setCellValue(m.getContractRevenue().doubleValue());
			contractCell.setCellStyle(currencyStyle);

			Cell totalCell = row.createCell(4);
			totalCell. setCellValue(m.getTotalRevenue().doubleValue());
			totalCell.setCellStyle(currencyStyle);

			row.createCell(5).setCellValue(m.getTransactionCount());
		}

		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createCreditSummarySheet(Sheet sheet, CreditReportResponse report,
	                                      CellStyle titleStyle, CellStyle headerStyle,
	                                      CellStyle dataStyle, CellStyle numberStyle, CellStyle currencyStyle) {
		int rowNum = 0;

		Row titleRow = sheet.createRow(rowNum++);
		Cell titleCell = titleRow.createCell(0);
		titleCell. setCellValue(report.getReportTitle());
		titleCell. setCellStyle(titleStyle);
		sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));

		rowNum++;

		Row dateRow = sheet.createRow(rowNum++);
		dateRow.createCell(0).setCellValue("Ngày báo cáo:");
		dateRow.createCell(1).setCellValue(report. getReportDate().toString());

		rowNum++;

		createSummaryRowLong(sheet, rowNum++, "Tổng tín chỉ phát hành:", report.getTotalCreditsIssued(), dataStyle);
		createSummaryRowLong(sheet, rowNum++, "Tín chỉ đã bán:", report.getTotalCreditsSold(), dataStyle);
		createSummaryRowLong(sheet, rowNum++, "Tín chỉ đã retire:", report.getTotalCreditsRetired(), dataStyle);
		createSummaryRowLong(sheet, rowNum++, "Tín chỉ còn lại:", report.getTotalCreditsAvailable(), dataStyle);
		createSummaryRow(sheet, rowNum++, "Tổng CO2 (tấn):", report.getTotalCo2Tons(), dataStyle, numberStyle);
		createSummaryRow(sheet, rowNum++, "Tổng doanh thu:", report.getTotalRevenue(), dataStyle, currencyStyle);
		createSummaryRow(sheet, rowNum++, "Giá TB/tín chỉ:", report.getAveragePrice(), dataStyle, currencyStyle);

		for (int i = 0; i < 4; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createCreditYearlySheet(Sheet sheet, List<CreditReportResponse.YearlyCreditDetail> yearly,
	                                     CellStyle headerStyle, CellStyle dataStyle,
	                                     CellStyle numberStyle, CellStyle currencyStyle) {
		int rowNum = 0;

		Row headerRow = sheet.createRow(rowNum++);
		String[] headers = {"Năm", "Phát hành", "Đã bán", "Retire", "Còn lại", "CO2 (tấn)", "Doanh thu"};
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		for (CreditReportResponse.YearlyCreditDetail y : yearly) {
			Row row = sheet.createRow(rowNum++);
			row.createCell(0).setCellValue(y.getYear());
			row.createCell(1).setCellValue(y.getCreditsIssued());
			row.createCell(2).setCellValue(y.getCreditsSold());
			row.createCell(3).setCellValue(y.getCreditsRetired());
			row.createCell(4).setCellValue(y.getCreditsAvailable());

			Cell co2Cell = row. createCell(5);
			co2Cell.setCellValue(y.getCo2Tons().doubleValue());
			co2Cell.setCellStyle(numberStyle);

			Cell revenueCell = row.createCell(6);
			revenueCell.setCellValue(y. getRevenue().doubleValue());
			revenueCell.setCellStyle(currencyStyle);
		}

		for (int i = 0; i < headers. length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createCreditProjectSheet(Sheet sheet, List<CreditReportResponse.ProjectCreditDetail> projects,
	                                      CellStyle headerStyle, CellStyle dataStyle,
	                                      CellStyle numberStyle, CellStyle currencyStyle) {
		int rowNum = 0;

		Row headerRow = sheet.createRow(rowNum++);
		String[] headers = {"Mã DA", "Tên dự án", "Phát hành", "Đã bán", "Retire", "CO2 (tấn)", "Doanh thu"};
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		for (CreditReportResponse.ProjectCreditDetail p : projects) {
			Row row = sheet.createRow(rowNum++);
			row.createCell(0).setCellValue(p.getProjectCode());
			row.createCell(1).setCellValue(p.getProjectName());
			row.createCell(2).setCellValue(p.getCreditsIssued());
			row.createCell(3).setCellValue(p.getCreditsSold());
			row.createCell(4).setCellValue(p.getCreditsRetired());

			Cell co2Cell = row. createCell(5);
			co2Cell.setCellValue(p.getCo2Tons().doubleValue());
			co2Cell.setCellStyle(numberStyle);

			Cell revenueCell = row.createCell(6);
			revenueCell. setCellValue(p.getRevenue().doubleValue());
			revenueCell.setCellStyle(currencyStyle);
		}

		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private void createSummaryRow(Sheet sheet, int rowNum, String label, BigDecimal value,
	                              CellStyle labelStyle, CellStyle valueStyle) {
		Row row = sheet. createRow(rowNum);
		Cell labelCell = row.createCell(0);
		labelCell.setCellValue(label);
		labelCell.setCellStyle(labelStyle);

		Cell valueCell = row.createCell(1);
		valueCell.setCellValue(value != null ? value.doubleValue() : 0);
		valueCell.setCellStyle(valueStyle);
	}

	private void createSummaryRowLong(Sheet sheet, int rowNum, String label, Long value, CellStyle style) {
		Row row = sheet.createRow(rowNum);
		row.createCell(0).setCellValue(label);
		row.createCell(1).setCellValue(value != null ? value :  0);
	}

	// ==================== PDF HELPER METHODS ====================

	private void addSummaryRow(PdfPTable table, String label, String value) {
		Font labelFont = new Font(Font. HELVETICA, 10, Font.BOLD);
		Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

		PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
		labelCell.setBorder(0);
		labelCell.setPadding(5);
		table.addCell(labelCell);

		PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
		valueCell.setBorder(0);
		valueCell.setPadding(5);
		table.addCell(valueCell);
	}

	private void addTableHeader(PdfPTable table, String...  headers) {
		Font headerFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);

		for (String header : headers) {
			PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
			cell.setBackgroundColor(new Color(34, 139, 34)); // Forest Green
			cell.setHorizontalAlignment(Element.ALIGN_CENTER);
			cell.setPadding(5);
			table.addCell(cell);
		}
	}

	private void addTableCell(PdfPTable table, String value) {
		Font cellFont = new Font(Font. HELVETICA, 9, Font.NORMAL);
		PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "", cellFont));
		cell.setPadding(4);
		table.addCell(cell);
	}

	private String formatNumber(BigDecimal value) {
		if (value == null) return "0";
		return String.format("%,.2f", value);
	}

	private String formatCurrency(BigDecimal value) {
		if (value == null) return "0 VND";
		return String. format("%,.0f VND", value);
	}
}
