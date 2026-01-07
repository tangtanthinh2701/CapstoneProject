package com.capston.project.back.end.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

public class ExcelHelper {
	public static final String TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

	public static boolean hasExcelFormat(MultipartFile file) {
		return TYPE.equals(file.getContentType());
	}

	public static Workbook getWorkbook(InputStream inputStream) throws IOException {
		return new XSSFWorkbook(inputStream);
	}

	public static String getCellValueAsString(Cell cell) {
		if (cell == null) {
			return null;
		}

		switch (cell.getCellType()) {
			case STRING:
				return cell.getStringCellValue().trim();
			case NUMERIC:
				if (DateUtil.isCellDateFormatted(cell)) {
					return cell.getLocalDateTimeCellValue().toLocalDate().toString();
				}
				return String.valueOf((long) cell.getNumericCellValue());
			case BOOLEAN:
				return String.valueOf(cell.getBooleanCellValue());
			case FORMULA:
				return cell.getCellFormula();
			case BLANK:
				return null;
			default:
				return null;
		}
	}

	public static BigDecimal getCellValueAsBigDecimal(Cell cell) {
		if (cell == null) {
			return null;
		}

		try {
			switch (cell.getCellType()) {
				case NUMERIC:
					return BigDecimal.valueOf(cell.getNumericCellValue());
				case STRING:
					String value = cell.getStringCellValue().trim();
					return value.isEmpty() ? null : new BigDecimal(value);
				default:
					return null;
			}
		} catch (Exception e) {
			return null;
		}
	}

	public static Integer getCellValueAsInteger(Cell cell) {
		if (cell == null) {
			return null;
		}

		try {
			switch (cell.getCellType()) {
				case NUMERIC:
					return (int) cell.getNumericCellValue();
				case STRING:
					String value = cell.getStringCellValue().trim();
					return value.isEmpty() ? null : Integer.parseInt(value);
				default:
					return null;
			}
		} catch (Exception e) {
			return null;
		}
	}

	public static Boolean getCellValueAsBoolean(Cell cell) {
		if (cell == null) {
			return false;
		}

		try {
			switch (cell.getCellType()) {
				case BOOLEAN:
					return cell.getBooleanCellValue();
				case STRING:
					String value = cell.getStringCellValue().trim().toLowerCase();
					return "true".equals(value) || "yes".equals(value) || "1".equals(value);
				case NUMERIC:
					return cell.getNumericCellValue() == 1;
				default:
					return false;
			}
		} catch (Exception e) {
			return false;
		}
	}

	public static LocalDate getCellValueAsLocalDate(Cell cell) {
		if (cell == null) {
			return null;
		}

		try {
			if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
				Date date = cell.getDateCellValue();
				return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
			} else if (cell.getCellType() == CellType.STRING) {
				String dateStr = cell.getStringCellValue().trim();
				return LocalDate.parse(dateStr);
			}
		} catch (Exception e) {
			return null;
		}
		return null;
	}

	public static List<String> getCellValueAsArray(Cell cell, String delimiter) {
		if (cell == null) {
			return null;
		}

		String value = getCellValueAsString(cell);
		if (value == null || value.isEmpty()) {
			return null;
		}

		return List.of(value.split(delimiter));
	}
}
