package com.capston.project.back.end.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OxiOwnershipRequest {

	@NotNull(message = "Contract ID is required")
	private Integer contractId;

	@NotNull(message = "Project ID is required")
	private Integer projectId;

	private Integer treeSpeciesId;

	@NotNull(message = "Owner ID is required")
	private UUID ownerId;

	@NotNull(message = "Ownership start date is required")
	private LocalDate ownershipStartDate;

	@NotNull(message = "Ownership end date is required")
	private LocalDate ownershipEndDate;

	@DecimalMin(value = "0.01", message = "Carbon credit percentage must be positive")
	@DecimalMax(value = "100.00", message = "Carbon credit percentage cannot exceed 100")
	private BigDecimal carbonCreditPercentage;
}