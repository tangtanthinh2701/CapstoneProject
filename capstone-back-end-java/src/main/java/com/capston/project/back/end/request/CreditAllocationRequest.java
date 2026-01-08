package com.capston.project.back.end.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditAllocationRequest {
	@NotNull(message = "Credit ID is required")
	private Integer creditId;

	@NotNull(message = "Ownership ID is required")
	private Integer ownershipId;

	private String notes;
}
