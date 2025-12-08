package com.capston.project.back.end.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCreditRequest {
	@NotNull(message = "ID dự án không được để trống")
	private Integer projectId;

	@NotNull(message = "Năm báo cáo không được để trống")
	@Min(value = 1900)
	private Integer reportYear;

	@DecimalMin(value = "0.0", message = "Giá mỗi tín chỉ phải >= 0")
	private BigDecimal pricePerCredit;

	private String verificationStandard;

	private String notes;
}
