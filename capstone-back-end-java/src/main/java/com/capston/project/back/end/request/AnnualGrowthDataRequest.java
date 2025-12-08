package com.capston.project.back.end.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnualGrowthDataRequest {
	@NotNull(message = "ID dự án không được để trống")
	private Integer projectId;

	@NotNull(message = "ID loài cây không được để trống")
	private Integer treeSpeciesId;

	@NotNull(message = "Năm báo cáo không được để trống")
	@Min(value = 1900, message = "Năm báo cáo không hợp lệ")
	@Max(value = 2100, message = "Năm báo cáo không hợp lệ")
	private Integer reportYear;

	@NotNull(message = "Số cây còn sống không được để trống")
	@Min(value = 0, message = "Số cây còn sống phải >= 0")
	private Integer treesAlive;

	@DecimalMin(value = "0.0", message = "Chiều cao trung bình phải >= 0")
	private BigDecimal avgHeight; // cm

	@DecimalMin(value = "0.0", message = "Đường kính tán phải >= 0")
	private BigDecimal avgCanopyDiameter; // cm

	@DecimalMin(value = "0.0", message = "Đường kính thân phải >= 0")
	private BigDecimal avgTrunkDiameter; // DBH - cm

	@DecimalMin(value = "0.0", message = "Tỷ lệ sống sót phải từ 0 đến 1")
	@DecimalMax(value = "1.0", message = "Tỷ lệ sống sót phải từ 0 đến 1")
	private BigDecimal survivalRate; // 0.0 - 1.0

	@Pattern(regexp = "^(EXCELLENT|GOOD|FAIR|POOR)$",
	         message = "Health status phải là: EXCELLENT, GOOD, FAIR, POOR")
	private String healthStatus;

	private String diseases;

	private String notes;
}
