package com.capston.project.back.end.request;

import jakarta.validation.constraints. DecimalMin;
import jakarta. validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonAllocationRequest {
	@NotNull(message = "Source phase ID is required")
	private Integer sourcePhaseId;

	@NotNull(message = "Target phase ID is required")
	private Integer targetPhaseId;

	@NotNull(message = "Carbon amount is required")
	@DecimalMin(value = "0.0001", message = "Carbon amount must be positive")
	private BigDecimal carbonAmount;

	private String notes;
}
