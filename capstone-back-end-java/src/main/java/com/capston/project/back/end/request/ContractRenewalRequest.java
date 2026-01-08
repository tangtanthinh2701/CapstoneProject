package com.capston.project.back.end.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRenewalRequest {

	@NotNull(message = "Contract ID is required")
	private Integer contractId;

	@NotNull(message = "Renewal term years is required")
	@Min(value = 1, message = "Renewal term must be at least 1 year")
	private Integer renewalTermYears;

	private BigDecimal renewalAmount;

	private String notes;

	private UUID requestedBy;
}