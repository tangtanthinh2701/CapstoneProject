package com.capston.project.back.end.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
	private String locationText;
	private BigDecimal latitude;
	private BigDecimal longitude;
	private BigDecimal area;
	private String areaUnit;
	private BigDecimal usableArea;
	private LocalDate plantingDate;
	private Integer totalTreesPlanned;
	private Integer totalTreesActual;
	private BigDecimal plantingDensity;
	private String projectStatus;
	private UUID managerId;
	private List<String> partnerOrganizations;
	private Boolean isPublic;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private List<ProjectPhaseResponse> phases;
}
