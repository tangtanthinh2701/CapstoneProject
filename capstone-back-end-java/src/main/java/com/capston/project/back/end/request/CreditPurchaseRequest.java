package com.capston.project.back.end.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditPurchaseRequest {
	@NotNull(message = "Credit ID is required")
	private Integer creditId;

	@NotNull(message = "Enterprise ID is required")
	private UUID enterpriseId;

	@NotNull(message = "Quantity is required")
	@Min(value = 1, message = "Quantity must be at least 1")
	private Integer quantity;

	private BigDecimal unitPrice; // Optional, use credit's price if not provided
}
