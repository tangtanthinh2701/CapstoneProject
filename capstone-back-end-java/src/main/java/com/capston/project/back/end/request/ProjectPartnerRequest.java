package com.capston.project.back.end.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPartnerRequest {
	@NotNull(message = "Project ID is required")
	private Integer projectId;

	@NotNull(message = "Partner ID is required")
	private Integer partnerId;

	private String role;

	private String notes;
}
