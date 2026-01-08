package com.capston.project.back.end.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractTerminationRequest {

	@NotBlank(message = "Termination reason is required")
	private String terminationReason;

	private UUID terminatedBy;
}