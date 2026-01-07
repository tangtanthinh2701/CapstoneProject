package com.capston.project.back.end.response;

import lombok.*;

import java.math. BigDecimal;
import java. util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonSummaryResponse {
	private Integer phaseId;
	private String phaseName;
	private Integer phaseOrder;

	// Target vs Actual
	private BigDecimal targetCarbon;           // Mục tiêu carbon
	private BigDecimal purchasedCarbon;        // Carbon từ cây đã mua
	private BigDecimal allocatedFromReserve;   // Carbon từ quỹ dư
	private BigDecimal totalAcquiredCarbon;    // Tổng carbon đã có
	private BigDecimal actualAbsorbedCarbon;   // Carbon thực tế đã hấp thụ

	// Status
	private BigDecimal carbonDeficit;          // Số carbon còn thiếu (nếu < 0 là dư)
	private BigDecimal carbonSurplus;          // Số carbon dư
	private BigDecimal completionPercentage;   // % hoàn thành

	// Cost
	private BigDecimal totalCost;              // Tổng chi phí mua cây
	private BigDecimal budgetRemaining;        // Ngân sách còn lại

	// Purchases
	private List<TreePurchaseResponse> purchases;

	// Reserve info
	private BigDecimal reserveAvailable;       // Carbon từ quỹ có thể dùng
}
