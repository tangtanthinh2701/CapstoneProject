package com.capston.project.back.end.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipSummaryResponse {
	private Long totalOwnerships;
	private Long activeOwnerships;
	private Long pendingOwnerships;
	private Long expiredOwnerships;
	private Long expiringSoonOwnerships;

	private Long totalTransfers;
	private Long pendingTransfers;
	private Long completedTransfers;

	private BigDecimal totalCarbonPercentageOwned;
}