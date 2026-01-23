package com.capston.project.back.end.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditRetireRequest {

	@NotNull(message = "Credit ID is required")
	private Integer creditId;

	@NotNull(message = "Quantity to retire is required")
	@Min(value = 1, message = "Quantity must be at least 1")
	private Integer quantity;

	@NotBlank(message = "Retirement reason is required")
	private String reason;

	private String certificateUrl;
}