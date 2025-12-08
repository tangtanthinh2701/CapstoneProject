package com.capston.project.back.end.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRequest {
	@NotNull(message = "ID dự án không được để trống")
	private Integer projectId;

	private String contractType = "OWNERSHIP";

	@Min(value = 1, message = "Số cây phải > 0")
	private Integer numTrees;

	@DecimalMin(value = "0.01", message = "Diện tích phải > 0")
	private BigDecimal area;

	@NotNull(message = "Đơn giá không được để trống")
	@DecimalMin(value = "0.0", message = "Đơn giá phải >= 0")
	private BigDecimal unitPrice;

	@Min(value = 1, message = "Thời hạn hợp đồng phải >= 1 năm")
	private Integer contractTermYears;

	private LocalDate startDate;

	@Future(message = "Ngày kết thúc phải ở tương lai")
	private LocalDate endDate;

	private Boolean autoRenewal = false;

	private Integer renewalTermYears;

	@DecimalMin(value = "0.0", message = "% tín chỉ phải >= 0")
	@DecimalMax(value = "100.0", message = "% tín chỉ phải <= 100")
	private BigDecimal carbonCreditSharing = new BigDecimal("100.00");

	private Boolean harvestRights = false;

	private Boolean transferAllowed = false;

	private BigDecimal earlyTerminationPenalty;

	private LocalDate paymentDate;

	private String notes;
}
