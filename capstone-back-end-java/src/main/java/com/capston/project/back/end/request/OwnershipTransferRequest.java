package com.capston.project.back.end.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipTransferRequest {

	private Integer contractId;

	private Integer ownershipId;

	@NotNull(message = "From user ID is required")
	private UUID fromUserId;

	@NotNull(message = "To user ID is required")
	private UUID toUserId;

	@DecimalMin(value = "0.01", message = "Carbon credit percentage must be positive")
	@DecimalMax(value = "100.00", message = "Carbon credit percentage cannot exceed 100")
	private BigDecimal carbonCredit;

	private BigDecimal transferPrice;

	private String notes;
}
