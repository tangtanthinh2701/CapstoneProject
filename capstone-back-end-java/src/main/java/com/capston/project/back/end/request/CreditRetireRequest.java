package com.capston.project.back.end.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditRetireRequest {

	@NotNull(message = "Transaction ID is required")
	private Integer transactionId;

	@NotBlank(message = "Retirement reason is required")
	private String retirementReason;

	private String certificateUrl;
}