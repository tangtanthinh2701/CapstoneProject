package com.capston.project.back.end.response;

import com.capston.project.back.end.common.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {
	private Integer id;
	private String code;
	private String name;
	private String description;
	private ProjectStatus projectStatus;
	private UUID managerId;
	private Boolean isPublic;

	private BigDecimal budget;
	private BigDecimal targetConsumedCarbon;
	private BigDecimal currentConsumedCarbon;

	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	private List<ProjectPhaseResponse> phases;

	private Integer totalPhases;
	private Long completedPhases;
}
