package com.capston.project.back.end.request;

import com.capston.project.back.end.common.CreditStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCreditRequest {
	@NotNull(message = "Project ID is required")
	private Integer projectId;

	@NotNull(message = "Issuance year is required")
	@Min(value = 2000, message = "Issuance year must be at least 2000")
	private Integer issuanceYear;

	@NotNull(message = "Total CO2 tons is required")
	@DecimalMin(value = "0.01", message = "Total CO2 must be positive")
	private BigDecimal totalCo2Tons;

	@NotNull(message = "Credits issued is required")
	@Min(value = 1, message = "Credits issued must be at least 1")
	private Integer creditsIssued;

	@DecimalMin(value = "0.01", message = "Base price per credit must be positive")
	private BigDecimal basePricePerCredit;

	private BigDecimal currentPricePerCredit;

	private String verificationStandard;

	private LocalDate verificationDate;

	private String certificateUrl;

	private UUID issuedBy;

	private CreditStatus creditStatus;

	private List<CreditOriginRequest> origins;

	private OffsetDateTime expiresAt;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class CreditOriginRequest {
		private Integer farmId;
		private Integer batchId;
		private Integer quantity;
	}
}
