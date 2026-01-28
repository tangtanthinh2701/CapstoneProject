package com.capston.project.back.end.request;

import com.capston.project.back.end.common.ProjectStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRequest {
	@NotBlank(message = "Project name is required")
	@Size(max = 255, message = "Project name must not exceed 255 characters")
	private String name;

	private String description;

	private ProjectStatus projectStatus;

	private UUID managerId;

	@Valid
	private List<ProjectPhaseRequest> phases;
}
