package com.capston.project.back.end.response;

import com.capston.project.back.end.common.CreditStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCreditResponse {

	private Integer id;
	private String creditCode;

	// Project info
	private Integer projectId;
	private String projectName;
	private String projectCode;

	private List<TreeOriginResponse> origins;

	// Credit details
	private Integer issuanceYear;
	private BigDecimal totalCo2Tons;
	private Integer creditsIssued;
	private Integer creditsSold;
	private Integer creditsRetired;
	private Integer creditsAvailable;
	private BigDecimal pricePerCredit;

	// Status
	private CreditStatus creditsStatus;
	private Boolean hasAvailableCredits;
	private Boolean isExpired;

	// Verification
	private String verificationStandard;
	private String certificateUrl;

	// Issuer info
	private UUID issuedBy;
	private OffsetDateTime issuedAt;
	private OffsetDateTime expiresAt;

	// Tracking
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	// Related data
	private List<CreditAllocationResponse> allocations;
	private Integer totalTransactions;
	private BigDecimal totalRevenue;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class TreeOriginResponse {
		private Integer farmId;
		private String farmName;
		private Integer batchId;
		private String batchCode;
		private Integer quantity;
	}
}
