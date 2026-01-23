package com.capston.project.back.end.response;

import com.capston.project.back.end.common.PhaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPhaseResponse {
	private Integer id;
	private Integer projectId;
	private Integer phaseNumber;
	private String phaseName;
	private String description;
	private PhaseStatus phaseStatus;
	private LocalDate plannedStartDate;
	private LocalDate plannedEndDate;
	private LocalDate actualStartDate;
	private LocalDate actualEndDate;
	private BigDecimal budget;
	private BigDecimal actualCost; // Computed field
	private BigDecimal targetCo2Kg;
	private BigDecimal actualCo2Kg; // Computed field
	private String notes;
	private UUID createdBy;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
