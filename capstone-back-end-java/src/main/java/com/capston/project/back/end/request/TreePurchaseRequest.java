package com.capston.project.back.end.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreePurchaseRequest {
	@NotNull(message = "Phase ID is required")
	private Integer phaseId;

	@NotNull(message = "Farm ID is required")
	private Integer farmId;

	@NotNull(message = "Tree species ID is required")
	private Integer treeSpeciesId;

	@NotNull(message = "Quantity is required")
	@Min(value = 1, message = "Quantity must be at least 1")
	private Integer quantity;

	@NotNull(message = "Unit price is required")
	@DecimalMin(value = "0.01", message = "Unit price must be positive")
	private BigDecimal unitPrice;

	private LocalDate purchaseDate;

	private String notes;
}
