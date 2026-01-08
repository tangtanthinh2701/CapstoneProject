package com.capston.project.back.end.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditSummaryResponse {
	// Credits
	private Long totalCreditRecords;
	private Long availableCreditRecords;
	private Long soldOutCreditRecords;

	private Long totalCreditsIssued;
	private Long totalCreditsSold;
	private Long totalCreditsRetired;
	private Long totalCreditsAvailable;

	// CO2
	private BigDecimal totalCo2Tons;

	// Revenue
	private BigDecimal totalRevenue;
	private BigDecimal averagePricePerCredit;

	// Transactions
	private Long totalTransactions;
	private Long purchasedTransactions;
	private Long retiredTransactions;
}
